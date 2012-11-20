allover.js - pointcloud visualization
=====================================

**allover.js** provides in-browser pointcloud visualization using [three.js](http://mrdoob.github.com/three.js/). allover.js is currently under heavy development. You have been warned.

Dependencies
------------

allover.js has the following javascript dependencies, located in `vendor/` in the source tree:

* [jQuery v1.8.2](https://github.com/jquery/jquery/tree/1.8.2)
* [jQuery UI v1.9.0](https://github.com/jquery/jquery-ui/tree/1.9.0)
* [three.js r52](https://github.com/mrdoob/three.js/tree/r52)
* [three_stats.js r11](https://github.com/mrdoob/stats.js/tree/r11)
* [d3.js v2.10.3](https://github.com/mbostock/d3/tree/v2.10.3)
* [jquery.mousewheel.js v3.0.6](https://github.com/brandonaaron/jquery-mousewheel/tree/3.0.6)
* [colorbrewer.js v2.10.3](https://github.com/mbostock/d3/tree/v2.10.3/lib/colorbrewer)

Usage
-----

Currently there is no publicly acessible version of allover.js, so you will have to build a copy for yourself (see below).

Once you've got your environment set up to build allover.js, you can create the example visualization html file that comes with allover.js.
To create the html file, simply run:

```bash
grunt make-viewer
```

This will build allover.js, and create a sample viewer html file in `tmp/viewer.html`.
To view the viewer, you'll need to serve the html via http (since we request our point JSON over the network).
One simple way is to use python's SimpleHTTPSever, serving files from the `tmp/` directory in the allover.js source:

```bash
cd tmp/
python -m SimpleHTTPServer
```

This will start a HTTP server on port 8000 on your local host.
Navigate to this url in your web browser, and you should see an allover.js viewer load in points!


How to build allover.js
-----------------------

*These instructions were taken pretty much verbatim from the <a href="https://github.com/jquery/jquery/blob/master/README.md">jQuery README</a> before being modified for this project.*

In order to build allover.js, you need to have GNU make 3.8 or later, Node.js/npm latest, and git 1.7 or later. (Earlier versions might work OK, but are not tested.) allover.js uses [Grunt](http://gruntjs.com/), the command line build tool used by the people at [jQuery](http://jquery.com/).

Windows users have two options:

1. Install [msysgit](https://code.google.com/p/msysgit/) (Full installer for official Git),
   [GNU make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm), and a
   [binary version of Node.js](http://node-js.prcn.co.cc/). Make sure all three packages are installed to the same
   location (by default, this is C:\Program Files\Git).
2. Install [Cygwin](http://cygwin.com/) (make sure you install the git, make, and which packages), then either follow
   the [Node.js build instructions](https://github.com/ry/node/wiki/Building-node.js-on-Cygwin-%28Windows%29) or install
   the [binary version of Node.js](http://node-js.prcn.co.cc/).

Mac OS users should install Xcode (comes on your Mac OS install DVD, or downloadable from
[Apple's Xcode site](http://developer.apple.com/technologies/xcode.html)) and
[Homebrew](http://mxcl.github.com/homebrew/). Once Homebrew is installed, run `brew install git` to install git,
and `brew install node` to install Node.js.

Linux/BSD users should use their appropriate package managers to install make, git, and node, or build from source
if you swing that way. Easy-peasy.

Once you've got that all set up, clone of copy of allover.js:

```bash
git clone http://github.com/CRREL/allover.js
```

Enter the directory and install the Node dependencies:

```bash
cd allover.js && npm install
```

Make sure you have `grunt` installed by testing:

```bash
grunt -version
```

Then build allover.js:

```bash
grunt
```

The built version (and a minified copy) will be put in the `dist/` subdirectory. You can include either of these javascript files in your project (see above in 'Usage').


Questions?
----------

If you have any questions, please feel free to ask in #pdal in irc.freenode.net.
