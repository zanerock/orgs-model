#!/usr/bin/env perl

use strict; use warnings;

my $OUT_DIR;
if (scalar(@ARGV) == 1) {
	$OUT_DIR=$ARGV[0];
}
elsif (scalar(@ARGV) > 1) {
	print STDERR "Usage: liq-gen-make [target output directory]\n  Output defaults to 'policy'.\n";
}
else {
	$OUT_DIR='policy'
}

my $sources = `find -L node_modules/\@liquid-labs -path "*/policy-*/policy/*" -name "*.md"`;

my %refs_tracker = ();
my @all = ();

my $common_make = <<'EOF';
BIN := $(shell npm bin)

SETTINGS_CONV := $(BIN)/liq-settings-conv
PROJ_MAPPER := $(BIN)/liq-proj-mapper
REFS_GEN := $(BIN)/liq-refs-gen
TSV_FILTER := $(BIN)/liq-standards-filter-abs
TSV2MD := $(BIN)/liq-tsv2md
GUCCI := $(BIN)/gucci

POLICY_PROJECTS = $(shell find node_modules/@liquid-labs -maxdepth 1 -name "policy-*")
ASSET_DIRS = $(shell find node_modules/@liquid-labs -path "*/policy-*/policy/*" -type d)

default: all

EOF

$common_make .= <<"EOF";
clean:
	rm -rf .build/* $OUT_DIR/*

EOF

$common_make .= <<'EOF';
.build:
	mkdir -p $@

.build/settings.yaml : settings.sh $(SETTINGS_CONV) | .build
	$(SETTINGS_CONV) "$@" "$<"

.build/proj-maps.pl : $(POLICY_PROJECTS) $(PROJ_MAPPER) | .build
	rm -f "$@"
	$(PROJ_MAPPER) "$@" $(POLICY_PROJECTS)

EOF

print $common_make;

foreach my $source (split /\n/, $sources) {
  (my $safe_source = $source) =~ s/ /\\ /g;
  my @bits = split(/\/+/, $source);
  my $pivot = 0;
  for (@bits) {
    if (/^@/) { last; }
    $pivot += 1;
  }
  my $project = join("/", @bits[$pivot...$pivot + 1]);
  my $common_path = join("/", @bits[$pivot + 3...$#bits - 1]);
  $common_path ne 'policy' or $common_path = '';
	my $raw_name = $bits[$#bits];
  (my $base_name = $raw_name) =~ s/\.md//;
  (my $safe_name = $base_name) =~ s/ /\\ /g;

  if (!exists($refs_tracker{$common_path})) {
    print ".build/$common_path/policy-refs.yaml : ".'$(ASSET_DIRS) $(REFS_GEN) .build/proj-maps.pl .build/settings.yaml | .build'."\n";
    print "\t".'rm -f "$@"'."\n";
    print "\t".'mkdir -p $(dir $@)'."\n";
    print "\t".'$(REFS_GEN) "$@" ./.build/proj-maps.pl "'.${project}.'" "'.${common_path}.'" $(ASSET_DIRS)'."\n";
    print "\t".'cat "$@" .build/settings.yaml > tmp.yaml && mv tmp.yaml "$@"'."\n";
    print "\n";

    $refs_tracker{$common_path} = ".build/${common_path}/policy-refs.yaml";
  }

  (my $items = $source) =~ s/\.md/ - items.tsv/;
  (my $safe_items = $safe_source) =~ s/\.md/\\ -\\ items.tsv/;
  my $tsv = '';
  my $tmpl = '';
  if (-e "$items") {
		my @incs=`grep -E "^# *include +" "$items"`;
		@incs = map { s|^#\s*include\s*|node_modules/${project}/policy/|; s/ /\\ /g; chomp($_); "$_.tsv"; } @incs;

    $tsv = ".build/${common_path}/${safe_name}".'\ -\ items.tsv';
    print "$tsv : $safe_items".' settings.sh '.join(' ', @incs).' $(TSV_FILTER) | .build'."\n";
    print "\t".'rm -f "$@"'."\n";
    print "\t".'$(TSV_FILTER) --settings=settings.sh "$<" "$@"'."\n";
    print "\n";

    $tmpl = ".build/${common_path}/${safe_name}".'\ -\ items.tmpl';
    print "$tmpl : ".$tsv.' $(TSV2MD) | .build'."\n";
    print "\t".'rm -f "$@"'."\n";
    print "\t".'$(TSV2MD) "$<" "$@"'."\n";
    print "\n";
  }
  else {
    $safe_items = '';
  }

  my $safe_target = "${OUT_DIR}/${common_path}/${safe_name}.md";
  my $refs = $refs_tracker{$common_path};
	my @deps = do "./.build/${common_path}/${raw_name}.deps" or ();
	my $deps_string = '';
	if ($#deps >= 0) {
		my @safe_deps = map { s| |\\ |g; $_; } @deps;
		$deps_string = join(' ', @safe_deps);
	}
  print "$safe_target : $safe_source $tmpl $refs .build/settings.yaml $deps_string\n";
  print "\t".'mkdir -p $(shell dirname "$@")'."\n"; # $(dir...) does not play will spaces
  print "\tcat $deps_string $tmpl ".'"$<" | $(GUCCI) --vars-file '.$refs.' -s IS_SUBMIT_AUDIT=0 -s IS_PR_AUDIT=0 > "$@" || { rm "$@"; echo "\nFailed to make\n$@\n"; }'."\n";
  print "\n";

  push(@all, $safe_target);
}

print "all: ".join(" ", @all);
