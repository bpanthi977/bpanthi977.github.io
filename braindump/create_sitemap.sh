#!/bin/sh

find . -name "*.html" -not -path "*/data/*"  | sed "s/.\\//https:\\/\\/bpanthi977.com\\/braindump\\//" > sitemap.txt

./create_sitemap.lisp
