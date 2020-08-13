#!/usr/bin/env perl

# Called from the generated main.makefile to create a map from an absolute gucci/godoc
# '.devices.standards.SOME_STANDARD' style reference to a relative URL reference.

use strict; use warnings;

my $out = shift;
my %proj_map = do $ARGV[0]; shift;
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
  my $package = join('/', @bits[$path_pivot...$path_pivot + 1]);
  $path_pivot += 3;

  foreach my $bit (@bits[$path_pivot...$#bits]) {
    if ($bit eq "policy") { next; } # TODO: is this check still necessary?
    exists $tracker->{"dirs"}->{$bit} or $tracker->{"dirs"}->{$bit} = { "dirs" => {}, "files" => [] };
    $tracker = $tracker->{"dirs"}->{$bit};
  }

  my @adjustment;
  my $match_count = 0;
  my $index = 0;

  my @rel_bits = split(/\//, $rel_path);
  my $exo_path = join('/', @bits[$path_pivot...$#bits]);
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

  my $find_str;
  if ($is_my_package) {
    my $find_path = join('/', @adjustment);
    if (!$find_path) { $find_path = '.'; }
    # There may be a merged folder combination which the source directories only partially reflect (and honce, the
    # directory existence test).
    $find_str = `test -d 'node_modules/\@${package}/policy/${rel_path}' && cd 'node_modules/\@${package}/policy/${rel_path}' && find '$find_path' -maxdepth 1 -name '*.md'`;
  }
  else {
    $find_str = `test -d "node_modules/\@${package}/policy/${exo_path}" && cd "node_modules/\@${package}/policy/${exo_path}" && find . -maxdepth 1 -name "*.md"`;
  }
  my @files = split /\n/, $find_str;

  if (!$is_my_package) {
    @files = map {
        s|^\./||;
        join('/', @adjustment)."/$_";
      } @files;
  }

  # Different packages may have the same structure, so files may build up.
  push @{$tracker->{"files"}}, @files;
}

# use Data::Dumper; print STDERR Dumper($refs);

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
    $file =~ s/ /%20/g;
    print $fd "${var_name}: ${file}\n";
  }

  foreach my $dir (keys %{$refs->{"dirs"}}) {
    print $fd " " x ($depth * 2);
    print $fd "${dir}:\n";

    my @new_path = (@$path, ($dir));
    print_refs($refs->{"dirs"}->{$dir}, \@new_path);
  }
} # foreach path

print_refs($refs, []);
close $fd;
