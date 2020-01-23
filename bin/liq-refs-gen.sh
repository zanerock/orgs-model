#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

BASE="$PWD"
OUTPUT="$1"; shift
ROOT="$1"; shift

cd "$ROOT"

perl -e '
  use strict; use warnings;

  my $out = shift;
  my @paths = split /\n/, $ARGV[0];

  my $refs = { "dirs" => {}, "files" => [] };

  foreach my $path (@paths) {
    $path =~ s|^/||;
    my @bits = split /\//, $path;
    my $tracker = $refs;
    foreach my $bit (@bits) {
      exists $tracker->{"dirs"}->{$bit} or $tracker->{"dirs"}->{$bit} = { "dirs" => {}, "files" => [] };
      $tracker = $tracker->{"dirs"}->{$bit};
    }

    my $find_str = `cd "$path"; find . -maxdepth 1 -name "*.md"`;
    my @files = split /\n/, $find_str;
    map s|\./||, @files;

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
      $var_name =~ s/\.MD$//;
      $var_name =~ s/[\s_-]+/_/g;

      print $fd " " x ($depth * 2 + 2);
      print $fd "${var_name}: ".join("/", @$path)."/${file}\n";
    }

    foreach my $dir (keys %{$refs->{"dirs"}}) {
      print $fd " " x ($depth * 2 + 2);
      print $fd "${dir}:\n";

      my @new_path = (@$path, ($dir));
      print_refs($refs->{"dirs"}->{$dir}, \@new_path);
    }
  }

  print_refs($refs, []);
  close $fd;
  ' "${BASE}/${OUTPUT}" "$(for i in "$@"; do echo "${i/$ROOT/}"; done)"
exit

LAST_PATH=''

while (( $# > 0 )); do
  SEARCH_DIR="$1"; shift
  RELATIVE_PATH="$(echo "${SEARCH_DIR}" | sed -e 's|[^/]*/[^/]*/[^/]*/[^/]*/||')"
  CURR_PATH="$(dirname "${RELATIVE_PATH}")"
  if [[ "${CURR_PATH}" != "${LAST_PATH}" ]];

  TYPE="$(basename "$SEARCH_DIR")"
  SEARCH_DIR="$(echo "$SEARCH_DIR" | sed 's|/$||')"

  echo "$TYPE:"
  while read REF_FILE; do
    REF="$(basename "$REF_FILE")"
    echo -e "  $REF: foo"
  done < <(find "$SEARCH_DIR" -name "*.md")
done
