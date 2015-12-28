# Solution Notes

Originally, I attempted to iterate over a sequence and factor each number.  This was not performant and only completed in a reasonable period of time if I skipped over values that weren't factored by numbers less than a low threshold, but yielded incorrect results with a higher threshold.

Given the second part of the problem, the most reasonably performant solution involved filling a buffer of numbers by iterating over a limited sequence of factor multiples.  I subsequently refactored the first part of the problem to use this technique, and it completed in a reasonable period of time while also guaranteeing correctness of the result.
