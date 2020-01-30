#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

SHOW_DROPPED=0 # default; Perl false

if [[ $(uname) == 'Darwin' ]]; then
  GNU_GETOPT="$(brew --prefix gnu-getopt)/bin/getopt"
else
  GNU_GETOPT="$(which getopt)"
fi

TMP=$(${GNU_GETOPT} -o "s:D" -l "settings: show-dropped" -- "$@")
eval set -- "$TMP"
while [[ $1 != '--' ]]; do
  case "$1" in
    -s|--settings)
      if ! [[ -f "$2" ]]; then
        echo "Could not find settings file: $2" >&2
        exit 1
      fi
      VARS="${VARS:-} $(cat $2 | sed -e 's/#.*//' | tr '\n' ' ')"
      shift;;
    -D|--show-dropped)
      SHOW_DROPPED=1;;
  esac
  shift
done
shift
VARS=${VARS:1}

INPUT="${1}"
OUTPUT="${2}"
mkdir -p "$(dirname "${OUTPUT}")"
# +2 skips the (conventional) header
# tail +2 "${INPUT}"
env -i -S "$VARS" perl -e '
use strict; use warnings;

my $input_file = shift;
my $output_file = shift;

my %constants = (
  "SEC_TRIVIAL" => 1,
  "SEC_MODERATE" => 2,
  "SEC_HARDENED" => 3,
  "ALWAYS" => 1,
  "NEVER" => 0,
  "IS_SUBMIT_AUDIT" => 0,
  "IS_PR_AUDIT" => 0,
);

open my $out, ">", "$output_file" or die "Could not open \"$output_file\" ($!)";

sub process_line {
  my $line = shift;
  my $lineno = shift;

  my ($uuid, $subSection, $statement, $absCondition, $indCondition, $auditCondition, $refs) =
    split(/\t/, "$line") or die "Could not split record at line ${lineno}.";

  my @conditions = split(/\s*,\s*/, $absCondition);
  my $include = 1;

  while (@conditions && $include) {
    my $condition = shift @conditions;
    while (my ($k, $v) = each %ENV) {
      $condition =~ s/$k/$v/g;
    }
    while (my ($k, $v) = each %constants) {
      $condition =~ s/$k/$v/g;
    }

    $condition =~ /[0-9<>=]+/ or die "Invalid condition at line ${lineno}: $condition\nref: $uuid";

    eval "$condition" or $include = 0;
  }

  if ($include) {
    print $out "$line\n";
  }
  elsif ('$SHOW_DROPPED') {
    print STDERR "DROPPED: $uuid\n";
  }
}

sub process_file {
  my $file_name = shift;

  open my $in, "<", "$file_name" or die "Could not open \"$file_name\" ($!)";

  while (<$in>) {
    my $line="$_";
    my $lineno = $.;

    if ($lineno == 1) { next; } # eat the header

    chomp $line;

    if ($line =~ /^#\s*include\s+(.+)$/) {
      my $include_file = "${1}.tsv";
      my @parent_path_bits = split /\//, $file_name;
      my $inc_path = "node_modules/".$parent_path_bits[1]."/".$parent_path_bits[2]."/policy";
      $include_file = "${inc_path}/${include_file}";
      # print "Processing include: ${include_file}\n";
      process_file($include_file) or die "Failed while processing include at $lineno.\n";
    }
    elsif ($line !~ /^(#.*|\s*)$/) { # else skip blanks and comments
      process_line $line, $lineno;
    }
  }

  close $in;
}

process_file $input_file;
close $out;
' "${INPUT}" "${OUTPUT}"
