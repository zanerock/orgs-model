#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

INPUT="${1}"
OUTPUT="${2}"

source "${HOME}/.liquid-development/orgs/curr_org/sensitive/settings.sh"

mkdir -p $(dirname "$OUTPUT")

# skip the (conventional) header and following blank line
tail +2 "${INPUT}" | perl -e '
my $outFile = shift;
my $lastSubSection = "";
my $anyIncluded = 0;

my $output = "{{ define \"${outFile}\" }}\n\n";

while (<>) {
  use strict; use warnings;
  my ($uuid, $subSection, $statement, $absCondition, $indCondition, $refs) =
    split(/\t/, "$_");

  my @conditions = split(/\s*,\s*/, $absCondition);
  my $include = 1;

  while (@conditions && $include) {
    my $condition = shift @conditions;
    $condition =~ s/HAS_TECHNICAL_OPS/$ENV{'HAS_TECHNICAL_OPS'}/;
    $condition =~ s/DEVELOPS_APPS/$ENV{'DEVELOPS_APPS'}/;
    $condition =~ s/GEN_SEC_LVL/$ENV{'GEN_SEC_LVL'}/;
    $condition =~ s/SEC_TRIVIAL/1/;
    $condition =~ s/SEC_MODERATE/2/;
    $condition =~ s/SEC_HARDENED/3/;
    $condition =~ s/ALWAYS/1/;

    $condition =~ /[0-9]<>=/ or die "Invalid condition: '$condition'";

    eval "$condition" or $include = 0;
  }

  if ($include) {
    if ($subSection ne $lastSubSection) {
      $output .= "\n### $subSection\n\n";
      $lastSubSection = $subSection;
    }

    $output .= "* $statement\n";
    $anyIncluded = 1;
  }
}

if ($anyIncluded) {
  open(my $fh, ">", "build/${outFile}") or die "Could not open file \"$outFile\" $!";
  print $fh "$output\n{{ end }}\n";
}'  "$(basename "$OUTPUT")"
