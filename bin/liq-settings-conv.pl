#!/usr/bin/env perl

use strict; use warnings;

my $output = shift;
my $input = shift;

open my $fd, "<", $input or die "Cannot open '$input' for input.";
open my $out, ">", $output or die "Cannot open '$output' for output.";

my $in_multiline = 0;

while (my $line = <$fd>) {
  chomp $line;
  if ($in_multiline) {
    $line =~ s/^/  /;
    if ($line =~ s/'\s*$//) {
      $in_multiline = 0;
    }
  }
  elsif ($line !~ /^(#.*|\s*)$/) { # is a non-empty, non-comment line?
    # substite a 'non-quoted' value; if not-non-quoted value, then continue processing.
    if ($line !~ s/^([^']+)=([^'#]+)\s*(#.*)?$/$1 : $2/) {
      $line =~ s/([^']*)\s*=\s*'/$1 : '/;
      if ($line !~ /'[^']*'/) { # then it's multiline
        $line =~ s/:\s*'/: |\n  /;
        $in_multiline = 1;
      }
      else {
        $line =~ s/('[^']*')\s*(#.*)?$/$1/; # allow and remove trailing comments
      }
    } # else already handled by the '!~' with substitution. :)
  } # blank or comment test
  else { # is a non-multiline blank or comment
    next; # to skip the line print
  }

  print $out "$line\n";
}

close $fd;
close $out;
