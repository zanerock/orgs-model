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
tail +2 "${INPUT}" | env -i -S "$VARS" perl -e '
use strict; use warnings;

my $output_file = $ARGV[0];

my %constants = (
  "SEC_TRIVIAL" => 1,
  "SEC_MODERATE" => 2,
  "SEC_HARDENED" => 3,
  "ALWAYS" => 1,
  "NEVER" => 0
);

open my $fd, ">", "$output_file" or die "Could not open \"$output_file\" ($!)";

while (<STDIN>) {
  my $line="$_";
  chomp $line;
  my $lineno = $. + 1;

  if ($line !~ /^(#.*|\s*)$/) { # else skip blanks and comments
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
      print $fd "$line\n";
    }
    elsif ('$SHOW_DROPPED') {
      print STDERR "DROPPED: $uuid\n";
    }
  }
}
close $fd;
' "${OUTPUT}"
