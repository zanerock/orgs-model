#!/usr/bin/env perl

use strict; use warnings;

my $output = shift;
my $input = shift;

open my $fd, "<", $input;
open my $out, ">", $output;

my $in_multiline = 0;

while (my $line = <$fd>) {
  if ($line !~ /^(#.*|\s*)$/) {
    if ($in_multiline) {
      $line =~ s/^/  /;
      if ($line =~ s/'\s*//) {
        $in_multiline = 0;
      }
    }
    else {
      # first, try to match lines with no quotes
      if ($line !~ s/^([^']+)=([^'#]+)\s*(#.*)?$/$1 : $2/) {
        $line =~ s/([^']*)\s*=\s*'/$1 : '/;
        if ($line !~ /'[^']*'/) { # then it's multiline
          $line =~ s/:\s*'/: |\n  /;
          $in_multiline = 1;
        }
        else {
          $line =~ s/'\s*(#.*)?$/'/; # allow and remove trailing comments
        }
      }
    } # multiline or not
    chomp $line;
    print $out "$line\n";
  } # blank line
}
