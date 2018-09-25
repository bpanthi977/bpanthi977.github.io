---
title: Distributing chocolates to children
description: Exploring a frequently arising problem in combinatorics and probability
featured_image: 'sht'
date: "Tue Sep 25 14:06:03 +0545 2018"
markup: "mmark"
---
# In how many ways can you distribute `n` chocolates to `m` children?

## Simplifying the condition 
If we consider all chocolates to be different/unique (and of course children are also unique :) ), then the first chocolate can go to any one of the n children and the next one too can go to any one of the n children and so on. This gives `$ n * n * n *n ...(m\ times) = n^m$` possibilities.

## But 
here the chocolates aren't different from each other. So the first chocolate going to first child and second going to second one is the same as first chocolate going to second child and the second one going to the first one. These cases must be counted only once. So we are concerned only with how many chocolates each child gets in the end. This means the possible distributions are less than `$n^m$` . But exactly how much is it? is an interesting mathematical problem that I ask you to try yourself for a while :unamused: . 

## Stars and Sticks
This problem becomes trivial, when it is converted to a permutation problem concerned with arranging children and chocolates. Let's consider a case of 4 children and 7 chocolates. Denoting children by `|` and chocolates by `*` a possible arrangement is: 
<p style="text-align: center;">`*|**||****`</p>
If each child gets chocolates to the left of it then here the first child gets one chocolate, second one gets 2, third one gets nothing <a name="disappointed"> :disappointed:</a> while the fourth one gets four :smiley: . Now the problem is just this : In how many ways can we arrange n stars and m sticks ? 

There are (4-1)+7 = 10 places/position. So the sticks can be placed in
`$$ {{10}\choose {3}} = \frac {10!} {(10-3)! * 3!} = 120 $$` 
ways. After placing the sticks we can just fill in the position with chocolates in only one way. So this is the total number of way to distribute 7 chocolates to 4 children. Now of course, we could have filled in chocolates first and then the sticks. It gives the same result as 
`$$ {{10}\choose {7}} = \frac {10!} {(10-7)! * 7!} = 120 $$` 

## General Result
So for the case of `n` chocolates and `m` children, the result is :
`$$ {{n+m-1}\choose{n}} = \frac {n+m-1} {(m-1)! n!} = {{n+m-1}\choose{m-1}} $$`

# Other applications
Now this technique is useful for various problems, other than amusing children with chocolates. Lets try another problem: 

### Particles in boxes
If we are to put `n` identical particles in `m` non-identical boxes. Then the number of ways we can do this is same as the number of ways we can distribute n chocolates to m children.
`$$ {{n+m-1}\choose{n}} = \frac {n+m-1} {(m-1)! n!} $$ `

### In how many ways can you express a number as a sum of `n` non-negative numbers (considering order)
For example, the number 4 can be expressed as sum of 3 numbers in following four ways:
* 0+0+4, 0+4+0, 4+0+0,
* 0+1+3, 0+3+1, 1+0+3, 1+3+0, 3+0+1, 3+1+0 
* 0+2+2, 2+0+2, 2+2+0,
* 1+1+2, 1+2+1, 2+1+1

This is similar to distributing 4 chocolates to 3 children and equals `$ {{6}\choose{4}} = 15 $`.
But if we are to disregard order then there are just 4 possible ways. Generalizing to number N with n partitions is not this [simple][stirling].
[stirling]:https://en.m.wikipedia.org/wiki/Stirling_numbers_of_the_second_kind

# Oh, and remember
making children [sad](#disappointed) isn't nice. So, if we want each child to get at least one chocolate then we have to add some constraints to our [stars and bars] technique: There must be at least one stars on either side of each bar. 
<p align="center">`|***|*`<br>
`*|****|`<br>
`*|**|**`</p>

In the first case, the first child gets nothing, in second on the last one gets nothing and only in the third one do all children get at least one chocolate. So, now the sticks can only be placed in between the stars. Imagine having one seat between each stars, then we have to place 2 bars in any two seats among 4 seats. This can be done in `$ {{4}\choose{2}} = 6 $` ways. So in general if we need to ` distribute n chocolates to m children such that each child gets at least one chocolate ` then there are 

`$$ {{n-1}\choose{m-1}} = \frac {n-1} {(m-1)!(n-m)!} $$` ways to do that.

[stars and bars]: https://en.m.wikipedia.org/wiki/Stars_and_bars_(combinatorics)
