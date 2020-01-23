#!/usr/bin/env perl

use strict; use warnings;

my $out = shift;
$out = "$ENV{'PWD'}/${out}";
my $my_package = shift;
my $rel_path = shift;
my @paths = @ARGV;

my $refs = { "dirs" => {}, "files" => [] };

foreach my $path (@paths) {
  my $is_my_package = (index($path, $my_package) != -1);
  my @bits = split /\//, $path;
  my $tracker = $refs;
  my $path_pivot = 0;
  for (@bits) {
    if (/^@/) {
      $bits[$path_pivot] =~ s/^@//;
      last;
    }
    $path_pivot += 1;
  }
  if ($is_my_package) { $path_pivot += 3; }

  foreach my $bit (@bits[$path_pivot...$#bits]) {
    if ($bit eq "policy") { next; }
    exists $tracker->{"dirs"}->{$bit} or $tracker->{"dirs"}->{$bit} = { "dirs" => {}, "files" => [] };
    $tracker = $tracker->{"dirs"}->{$bit};
  }

  my $find_str;
  if ($is_my_package) {
    my @adjustment;
    my $match_count = 0;
    my $index = 0;

    my @rel_bits = split(/\//, $rel_path);
    for (@bits[$path_pivot...$#bits]) {
      if ($index > $#rel_bits) {
        @adjustment = @bits[($path_pivot + $index)...$#bits];
        last;
      }
      elsif ($_ ne $rel_bits[$index]) {
        @adjustment = ("..") x (scalar(@rel_bits) - $index);
        push(@adjustment, @bits[($path_pivot + $index)...$#bits]);
        last;
      }
      else {
        $index += 1;
      }
    }
    if (!@adjustment) {
      @adjustment = ("..") x (scalar(@rel_bits) - $index);
    }

    my $find_path = join('/', @adjustment);
    if (!$find_path) { $find_path = '.'; }
    $find_str = `cd 'node_modules/${my_package}/policy/${rel_path}'; find '$find_path' -maxdepth 1 -name '*.md'`;
  }
  else {
    $find_str = `cd "${path}"; find . -maxdepth 1 -name "*.md"`;
  }
  my @files = split /\n/, $find_str;

  $tracker->{"files"} = \@files;
}

# use Data::Dumper; print Dumper($refs);

open my $fd, ">", "$out" or die "Could not open ouput: $out";

sub print_refs {
  my $refs = shift;
  my $path = shift;
  my $depth = scalar @$path;

  foreach my $file (@{$refs->{"files"}}) {
    my $var_name = uc $file;
    $var_name =~ s/\.MD$//; #}{ # hack to fix Atom beautifier
    $var_name =~ s|.*/([^/]+)$|$1|; #}{
    $var_name =~ s/[\s_-]+/_/g; #}

    print $fd " " x ($depth * 2);
    # print $fd "${var_name}: ".join("/", @$path)."/${file}\n";
    print $fd "${var_name}: ${file}\n";
  }

  foreach my $dir (keys %{$refs->{"dirs"}}) {
    print $fd " " x ($depth * 2);
    print $fd "${dir}:\n";

    my @new_path = (@$path, ($dir));
    print_refs($refs->{"dirs"}->{$dir}, \@new_path);
  }
}

print_refs($refs, []);
close $fd;
