#!/usr/bin/env perl
use strict; use warnings;

my $file = shift;
my $output_file = shift;

my $lastSubSection = "";
my $anyIncluded = 0;
my $template_name = $file;
$template_name =~ s/\.\w+$//;
$template_name =~ s|\.build/||;

my $output = "{{- define \"${template_name}\" -}}\n\n";
open my $fd, "<", "$file";

while (<$fd>) {
  my ($uuid, $subSection, $statement, $absCondition, $indCondition, $auditCondition, $refs) = split(/\t/, "$_");
  $refs && chomp($refs);

  # TODO: this is wonky.
  #
  # The deal here is that policy statements don't have an audit condition, so the 6th parameter is actually 'refs'.
  if ($file =~ /Policy( - items.tsv)?$/) {
    chomp($auditCondition) or warn "Missing ref spec in '$file' at line $.";
    $refs = $auditCondition;
    undef $auditCondition;
  }

  if ($subSection ne $lastSubSection) {
    $output .= "\n### $subSection\n\n";
    $lastSubSection = $subSection;
  }

  $statement =~ s/\\n/\n/g;
  # TODO: This is a bit of a hack; were seeing '^M' invisible chars in git diff; for now, just clean up lingering non-
  # printable characters
  !$refs || $refs =~ s/[^[:print:]]+//g;
  # Note, GitHub adds 'user-content' to the id. (Whatever the reasons, it's a bad idea, but nothing we can do.)
  # However, they use JS to patch the behavior so that a '#user-content-xyz' and '#xyz' link work the same. A previous
  # version generated '<a id=', which seemed exempt from the 'user-content' mangling, but also caused render issues on
  # BitBucket. So, everything seems to be working OK now, but just in case it crops up, here's the note.
  $output .= "* <span id=\"$uuid\">$statement</span>".( !$refs || $refs eq '-' ? '' : " _($refs)_")."\n";
  $anyIncluded = 1;
}
close $fd;

open $fd, ">", "$output_file";
print $fd "${output}\n{{- end -}}\n";
close $fd;
