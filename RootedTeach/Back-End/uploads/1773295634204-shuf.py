#!/usr/local/cs/bin/python

"""
Output lines selected randomly from a file

This is a Python 3 implementation of GNU shuf command
"""


import random
import sys
import argparse

class ShuffleLines:
    def __init__(self, lines):
        """Initialize with a list of lines to shuffle"""
        # if isinstance(lines, list):
        self.lines = lines
        # else:
            # with open(lines, 'r') as f:
                # self.lines = f.readlines()

    def shuffle_once(self):
        """Shuffle the lines randomly"""
        out = list(self.lines)
        random.shuffle(out)
        return out

    def chooselines(self, count):
        """Choose count random lines (with replacement if repeat is true)"""
        # return random.choices(self.lines, k=count)
        return [random.choice(self.lines) for _ in range(count)]

def parse_input_range(parser, spec):
    if "-" not in spec:
        parser.error(f"invalid input range: '{spec}'")
    lo_s, hi_s = spec.split("-", 1)
    try:
        lo = int(lo_s)
        hi = int(hi_s)
    except ValueError:
        parser.error(f"incalid input range: '{spec}'")
    if lo > hi:
        parser.error(f"invalid input range: '{spec}'")
    return [f"{i}\n" for i in range(lo,hi +1)]

def read_input_lines(parser, args):
    if args.echo and args.input_range is not None:
        parser.error("options --echo and --input-range are mutually exclusive")

    if args.echo:
        if len(args.operands) == 0:
            parser.error("no arguments provided with -e option")
        return [op + "\n" for op in args.operands]

    if args.input_range is not None:
        if len(args.operands) != 0:
            parser.error(f"extra operand '{args.operands[0]}'")
        return parse_input_range(parser, args.input_range)

    if len(args.operands) == 0 or (len(args.operands) == 1 and args.operands[0] == "-"):
        return sys.stdin.readlines()

    if len(args.operands) == 1:
        try:
            with open(args.operands[0], "r", encoding="utf-8", errors="replace") as f:
                return f.readlines()
        except OSError as e:
            parser.error(f"{args.operands[0]}: {e.strerror}")

    parser.error(f"extra operand '{args.operands[1]}'")


def main():
    parser = argparse.ArgumentParser(
        prog="shuf.py",
        description="Write a random permutation of the imput lines to standard output.")
    
    parser.add_argument('-e', '--echo', 
                        action='store_true',
                        help='treat each ARG as an input line')
    
    parser.add_argument('-i', '--input-range',
                        metavar="LO-HI",
                        help='treat each number LO through HI as an input line')
   
    parser.add_argument('-n', '--head-count',
                        type=int, 
                        dest="head_count",
                        help='output at most COUNT lines')
   
    parser.add_argument('-r', '--repeat', 
                        action='store_true', 
                        help='outputlines can be repeated')

    parser.add_argument("operands", nargs='*',
                        help='input files or arguments for -e option')


    args = parser.parse_args()

    # head-count
    if args.head_count is not None and args.head_count < 0:
        parser.error(f"invalid line count: '{args.head_count}'")

    lines = read_input_lines(parser, args)

    # empty input
    if not lines:
        return
    
    shuffler = ShuffleLines(lines)

    # Repeat
    if args.repeat:
        if args.head_count is not None:
            out = shuffler.choose_with_replacement(args.head_count)
            sys.stdout.write("".join(out))
            return

        try:
            while True:
                sys.stdout.write(random.choice(lines))
        except KeyboardInterrupt:
            return

    out = shuffler.shuffle_once()
    if args.head_count is not None:
        out = out[:args.head_count]
    sys.stdout.write("".join(out))


if __name__ == "__main__":
    main()