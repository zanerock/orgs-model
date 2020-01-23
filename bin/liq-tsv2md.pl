#!/usr/bin/env perl
use strict; use warnings;

my $file = shift;
my $output_file = shift;

my $lastSubSection = "";
my $anyIncluded = 0;
my $template_name = $file;
$template_name =~ s/\.\w+$//;
$template_name =~ s|build/||;

my $output = "{{ define \"${template_name}\" }}\n\n";
open my $fd, "<", "$file";

while (<$fd>) {
  my ($uuid, $subSection, $statement, $absCondition, $indCondition, $auditCondition, $refs) = split(/\t/, "$_");

  if ($subSection ne $lastSubSection) {
    $output .= "\n### $subSection\n\n";
    $lastSubSection = $subSection;
  }

  $statement =~ s/\\n/\n/g;
  $output .= "* $statement\n";
  $anyIncluded = 1;
}
close $fd;

open $fd, ">", "$output_file";
print $fd "${output}\n{{ end }}\n";
close $fd;
