GoREACT Widget JavaScript API
===
GoREACT's Widget JavaScript API is a lightweight library for interfacing with GoREACT widgets.

##Getting started

Paste the following code on to each page of you site you would like to access GoREACT widgets. For single-page applications, only paste it once on the main index page.

```js
!function(){function a(a){var c=[];c.methods=a.split(" "),c.factory=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),c.push(b),c}};for(var d=0;d<c.methods.length;d++){var e=c.methods[d];c[e]=c.factory(e)}var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(b,f),window["goreact"]=c}var b=document.createElement("script");b.type="text/javascript",b.async=!0,b.src="../build/widgets.js",a("init on destroy record upload playback collaborate list")}();
```

###[View Client API](https://github.com/GoREACT/widgets-client-api/wiki/Client-API)

###[Generating Signatures](https://github.com/GoREACT/widgets-client-api/wiki/Generating-Signatures)

###[Webhooks](https://github.com/GoREACT/widgets-client-api/wiki/Webhooks)