#!/usr/bin/env sbcl --script
(require 'uiop)

(defun convert-sitemap-txt-to-xml (input-file output-file)
  (with-open-file (stream output-file
                          :direction :output
                          :if-exists :supersede)

    (format stream "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
")
    (loop for url in (uiop:read-file-lines input-file) do
      (format stream "~&  <url>
    <loc>~a</loc>
  </url>" url))

    (format stream "~&</urlset>")))

(convert-sitemap-txt-to-xml "./sitemap.txt" "./sitemap.xml")
