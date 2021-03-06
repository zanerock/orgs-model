#!/usr/bin/env perl

use strict; use warnings;
use Data::Dumper;

if ($#ARGV == -1) { die "Usage:\nliq-init-docs run # to initialize\nand:\nliq-init-docs <file> <data file>"; }

if ($ARGV[0] eq 'run') {
  mkdir('.build');
  my $OUT_DIR;
  if (scalar(@ARGV) == 2) {
    $OUT_DIR="${ARGV[1]}"
  }
  else {
  	$OUT_DIR='policy'
  }

  my @sources = split(/\n/, `find -L node_modules/\@liquid-labs -path "*/policy-*/policy/*" -name "*.md" -o -name "*.tmpl" -not -path "node_modules/*/node_modules/*" | grep -v '/tmpl/'`); # #TODO: the '/tmpl/' files are from an older layout and will go away'
  open my $fd, ">", ".build/resolve.makefile" or die "Could not create makefile for resolve.";

  my $common_make = <<'EOF';
BIN := $(shell npm bin)

INIT_DOCS := $(BIN)/liq-init-docs
GEN_MAKE := $(BIN)/liq-gen-make

default: .build/main.makefile
EOF
  print $fd "$common_make\n";

  my @targets = ();
  for (@sources) {
    my $safe_name = $_;
    $safe_name =~ s| |\\ |g;
    my $target = $safe_name;
    $target =~ s|[^@]*\@liquid-labs/[^/]+/policy/(.+)|.build/$1.deps|;
    $targets[++$#targets] = $target;
    print $fd "$target : $safe_name\n";
    print $fd "\t".'mkdir -p $(shell dirname "$@")'."\n";
    print $fd "\t".'$(INIT_DOCS) "$<" "$@"'."\n";
    print $fd "\n"
  }

  print $fd ".build/main.makefile : ".join(' ', @targets)."\n";
  print $fd "\t".'$(GEN_MAKE) "'.$OUT_DIR.'" > "$@"'."\n";
  print $fd "\n";

  print "Initiating resolution build...\n";
  exec 'make -f .build/resolve.makefile --silent';
}

my $file = shift;
my $output = shift;
open(my $out, ">", $output) or die "Couldn't open data file: $output ($!)";
# TODO: we won't necessarily recognize a template spread across multilpe lines...

print $out "(\n";

# build the dependency list
sub process_for_template_deps {
  my $file = shift;
  my $deps_tracker = shift;

  open(my $fd, "<", $file) or die "Couldn't open input file: $file ($!)";

  while (<$fd>) {
    # TODO: extend the spec with a '+' or similar marker for inclusion, then replace it out of the file and build from
    # the replaced file. This will avoid overloadin the '-''
    # it's a hack, but we use the '-' to indicate whether it's an external or (no '-') internal template.
    /\{\{-\s*template\s+"([^"]+)"/ or next;
    /#no-dep/ and next;
    my $template = $1;
    $template =~ s/^\s+|\s+$//g;
    # we don't currently support cross-including item lists; only the partner file can do that.
    next if $template =~ /- items$/;
    $template .= '.tmpl';

    my $template_path;
    for (split /\n/, `find -L 'node_modules/\@liquid-labs' -maxdepth 1 -name "policy-*"`) {
      my $candidate = `find -L "$_" -path "*${template}" -not -path "node_modules/*/node_modules/*" -not -path "*/.yalc/*"`;
      chomp($candidate);
      ($candidate && $template_path) and die "Ambiguous template: ${template}. Found at '$candidate' and '$template_path'.";
      $candidate && ($template_path = $candidate);
    }

    !$template_path and die "Could not find template: ${template}.";
    $deps_tracker->{$template_path} = 1;

    # now, process that template
    process_for_template_deps($template_path, $deps_tracker);
  }

  close $fd;
}

my $deps_tracker2 = {};
process_for_template_deps($file, $deps_tracker2);
my @deps = keys %$deps_tracker2;

if (@deps) {
  print $out "'".join("',\n  '", @deps)."'";
}

print $out ");\n";

close $out;
