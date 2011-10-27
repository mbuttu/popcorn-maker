from __future__ import with_statement
from BeautifulSoup import BeautifulSoup
from shutil import copyfile
from shutil import rmtree
from contextlib import closing
from zipfile import ZipFile, ZIP_DEFLATED
import BaseHTTPServer
import cgi
import urllib
import json
import os

# TODO .. don't change source if link is HTTP
# handle same file name conflicts
# handle scripts written by document.writeln
# make sure rmtree is safe
# send proper http response if cannot complete request

# not as important:
  # beautify JS
  # name folder after project name
  # use os.path.join where appropriate

def uniquify(sequence):
  checked = []
  for element in sequence:
    if element not in checked:
      checked.append(element)
  return checked

##
## from http://stackoverflow.com/questions/296499/how-do-i-zip-the-contents-of-a-folder-using-python-version-2-5
##
def zipdir(basedir, archivename):
  assert os.path.isdir(basedir)
  with closing(ZipFile(archivename, "w", ZIP_DEFLATED)) as z:
    for root, dirs, files in os.walk(basedir):
      #NOTE: ignore empty directories
      for fn in files:
        absfn = os.path.join(root, fn)
        zfn = absfn[len(basedir) + len(os.sep):] 
        z.write(absfn, zfn)

class PostHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    
    def do_POST(self):
        # Parse the form data posted
        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers,
                     environ={
                       "REQUEST_METHOD": "POST",
                       "CONTENT_TYPE": self.headers["Content-Type"]
        })

        # Begin the response
        self.send_response(200)
        self.end_headers()
#        self.wfile.write('Client: %s\n' % str(self.client_address))
#        self.wfile.write('User-agent: %s\n' % str(self.headers['user-agent']))
#        self.wfile.write('Path: %s\n' % self.path)

        html = BeautifulSoup(urllib.unquote(form["html"].value))
        scripts = [s for s in html.findAll("script") if s.has_key("src")]
        css = [c for c in html.findAll("link") if c.has_key("href")]

        # FIND AND CHANGE CSS HREFS TOO!
        scriptsToChange = json.loads(form["scripts"].value)
        extensions = uniquify([os.path.splitext(script)[1][1:] for script in scriptsToChange.keys()])

#        extensions = [{ext: [script 
#                             for script in scripts 
#                             if os.path.splitext(script["src"])[1][1:] == ext]} 
#                      for ext in extensions]

        print extensions

        root = "project"

        if os.path.exists(root):
          rmtree(root)

        os.mkdir(root)

        for extension in extensions:
          pathToDir = "%s/%s" % (root, extension)
          os.mkdir(pathToDir)

          matchingScripts = [script 
                            for script in scripts 
                            if os.path.splitext(script["src"])[1][1:] == extension]

          for script in matchingScripts:
            absolute = [absolute for relative, absolute in scriptsToChange.items()
                        if relative == script["src"]][0]

            pathToFile = "%s/%s" % (pathToDir, absolute.split("/")[-1]) 
            print "moving %s to %s" % (absolute, pathToFile)
            copyfile(absolute, pathToFile)
            # change source of this script in the html file to point to the new path
            script["src"] = "/".join(pathToFile.split("/")[1:])

          for script in css:
            absolute = [absolute for relative, absolute in scriptsToChange.items()
                        if relative == script["href"]][0]

            pathToFile = "%s/%s" % (pathToDir, absolute.split("/")[-1]) 
            print "moving %s to %s" % (absolute, pathToFile)
            copyfile(absolute, pathToFile)
            # change source of this script in the html file to point to the new path
            script["src"] = "/".join(pathToFile.split("/")[1:])

        f = open("%s/index.html" % root, "w")
        f.write(html.prettify())

        # zip and remove file
        zipdir(root, ("%s.zip" % os.path.splitext(root)[0]))
        rmtree(root)

#          for script in matchingScripts:
#            for relative, absolute in script.items():
#              pathToFile = "%s/%s" % (pathToDir, absolute.split("/")[-1]) 
#              print "moving %s to %s" % (absolute, pathToFile)
#              copyfile(absolute, pathToFile)
#              # change source of this script in the html file to point to the new path
#              scr = relative in scripts and scripts.index(script)
#              # scr["src"] = "/".join(pathToFile.split("/")[1:])
#
#        for script in exportedScripts:
#          src = script["src"]
#
#        for script in scriptsToChange:
#          for k, v in script.items():
#            print "%s=%s" % (k, v)
#
#       #print soup.prettify()
#       # self.wfile.write("\n".join(["%s=%s" % (field, form[field].value) for field in form.keys()]))
#        for field in form.keys():
#            field_item = form[field]
#            # Regular form value
#            self.wfile.write('%s=%s' % (field, form[field].value))
#        return

if __name__ == '__main__':
    server = BaseHTTPServer.HTTPServer(('localhost', 9999), PostHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    server.serve_forever()
