#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

# pull off the output argument
OUTPUT="${@:$#}"
set -- "${@:1:$(($#-1))}"

mkdir -p $(dirname "$OUTPUT")

npx liq-standards-filter-abs "$@" | perl -e'
use strict; use warnings;

my $outFile = shift;
my $lastSubSection = "";
my $anyIncluded = 0;

my $output = "{{ define \"${outFile}\" }}\n\n";

while (<>) {

  my ($uuid, $subSection, $statement, $absCondition, $indCondition, $auditCondition, $refs) =
    split(/\t/, "$_");

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
