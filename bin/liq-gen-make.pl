#!/usr/bin/env perl

use strict; use warnings;

my $sources = `find node_modules/\@liquid-labs -path "*/policy-*/policy/*" -name "*.md"`;

my %refs_tracker = ();
my @all = ();

my $common_make = <<'EOF';
BIN = $(shell npm bin)

SETTINGS_CONV = $(BIN)/liq-settings-conv
PROJ_MAPPER = $(BIN)/liq-proj-mapper
REFS_GEN = $(BIN)/liq-refs-gen
TSV_FILTER = $(BIN)/liq-standards-filter-abs
TSV2MD = $(BIN)/liq-tsv2md
GUCCI = $(BIN)/gucci

POLICY_PROJECTS = $(shell find node_modules/@liquid-labs -maxdepth 1 -name "policy-*")
ASSET_DIRS = $(shell find node_modules/@liquid-labs -path "*/policy-*/policy/*" -type d)

default: all

clean:
	rm -rf .build/* policy/*

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
  (my $base_name = $bits[$#bits]) =~ s/\.md//;
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
    $tsv = ".build/${common_path}/${safe_name}".'\ -\ items.tsv';
    print "$tsv : $safe_items".' settings.sh $(TSV_FILTER) | .build'."\n";
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

  my $safe_target = "policy/${common_path}/${safe_name}.md";
  my $refs = $refs_tracker{$common_path};
  print "$safe_target : $safe_source $tmpl $refs .build/settings.yaml\n";
  print "\t".'mkdir -p $(shell dirname "$@")'."\n"; # $(dir...) does not play will spaces
  print "\tcat $tmpl ".'"$<" | $(GUCCI) --vars-file '.$refs.' > "$@" || { rm "$@"; echo "\nFailed to make\n$@\n"; }'."\n";
  print "\n";

  push(@all, $safe_target);
}

print "all: ".join(" ", @all);
