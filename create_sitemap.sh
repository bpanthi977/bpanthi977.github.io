#!/bin/sh

find . -name "*.html" -not -path "*/data/*"  | sed "s/.\\//https:\\/\\/bpanthi977.github.io\\//" > sitemap.txt

./create_sitemap.lisp
