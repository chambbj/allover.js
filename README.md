allover.js - pointcloud visualization
=====================================

**allover.js** provides in-browser pointcloud visualization using [three.js](http://mrdoob.github.com/three.js/). allover.js is currently under heavy development. You have been warned.

Dependencies
------------

allover.js is being developed with the following javascript dependencies:

* [jQuery v1.7.1](https://github.com/jquery/jquery/tree/1.7.1)
* [jQuery UI v1.8.11](https://github.com/jquery/jquery-ui/tree/1.8.11) (custom build)
* [three.js r50](https://github.com/mrdoob/three.js/tree/r50)
* [three_stats.js r10](https://github.com/mrdoob/stats.js/tree/r10)
* [d3.js v2.10.1](https://github.com/mbostock/d3/tree/v2.10.1)
* [jquery.mousewheel.js v3.0.6](https://github.com/brandonaaron/jquery-mousewheel/tree/3.0.6)


Usage
-----

Currently, there's no publicly accessible copy of allover.js, so to use you'll have to build your own copy (see below in 'How to build allover.js'). Once you've got yourself a copy, include the necessary JS files in your page then run the allover viewer, passing the point source url and the visualization DOM element:

```html
<div id="pointcloud-visualization"></div>
<link rel="stylesheet" type="text/css" href="/css/jquery-ui-1.8.11.custom.css">
<script src="/js/three.js"></script>
<script src="/js/three_stats.js"></script>
<script src="/js/d3.js"></script>
<script src="/js/jquery-ui-1.8.11.custom.min.js"></script>
<script src="/js/jquery.mousewheel.js"></script>
<script src="/js/allover.js"></script>
<script type="text/javascript">
  Allover.viewer.run('/export/1/text/', $('#pointcloud-visualization'));
</script>
```

The number in the point source url is the digit of the [GRiD](http://github.com/CRREL/GRiD) AOI pk that you're visualizing.

In later iterations of allover.js the style names will be more consistent and customizable, but for now you may have to add some styles to make your visualization look correct. Here's an example of what I've got running:

```css
body {
  background:#eeeeee;
  background-repeat:repeat-x;
}
.grid-progressBar-wrapper {
  margin: 4px 8px;
  float: right;
}
.grid-progressBar-status {
  display: inline-block;
}
.grid-progressBar {
  display: inline-block;
  height: 8px;
  width: 100px;
  margin: 2px 0 0 4px;
  position: relative;
  border: 1px solid #ccc;
}
.grid-progressBar-color {
  height: 8px;
  display: block;
  background-color: blue;
}
.grid-cameraControls, .grid-colorControls {
  margin: 16px 8px;
}
```

**Note:** those `grid-` prefixes will be changing to `allover-` soon.


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

If you have any questions, please feel free to ask in #crrel in irc.freenode.net.
