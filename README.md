GoREACT Widget JavaScript API
===
GoREACT's Widget JavaScript API is a lightweight library for interfacing with GoREACT widgets.

######Paste the following code
---

Paste the following code on to each page of you site you would like to access GoREACT widgets. For single-page applications, only paste it once on the main index page.

```js
!function(){function a(a){var c=[];c.methods=a.split(" "),c.factory=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),c.push(b),c}};for(var d=0;d<c.methods.length;d++){var e=c.methods[d];c[e]=c.factory(e)}var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(b,f),window["goreact"]=c}var b=document.createElement("script");b.type="text/javascript",b.async=!0,b.src="../build/widgets.js",a("init on destroy record upload playback collaborate list")}();
```

######Authorization
---

###goreact.authorize( settings )

Used to authorize GoReact and validate user. This function must be called and completed before any other API calls are made.

######Required params
---

**api_key : String**

Key used to interface with GoReact's JavaScript API.

**user_id : Number or String**

The ID of the current authenticated user.

**first_name : String**

The first name of the current authenticated user.

**last_name : String**

The last name of the current authenticated user.

**email : String**

The email address of the current authenticated user.

**context_id : String**

The id of the context which represents the scope of a given set of videos

**context_name : String**

The name of the context which represents the scope of a given set of videos

**context_role : Enum ("instructor", "reviewer", "presenter")**

The role of the context

######Optional params
---

**expires : UTC timestamp**

It will expire the signature at the given time. If not provided, *signature will not expire*?

######Events
---

The following events are dispatched when goreact.authorize() is called.

**authorize::success**

Invoked when the authorization was successful.

**authorize::error**

Invoked when the authorization has failed.


#####Example

```js
goreact.authorize({
    api_key: "9plmvlph",
    user_id: "5432b03462ccc7ea7bcc2c41",
    context_id: "5432b0923ea55a487d96b076",
    context_name: "Business Ed",
    context_role: "instructor",
    name: "John Smith",
    email: "john.smith@campus.edu",
    signature: "5eb63bbbe01eeed093cb22bb8f5acdc3",
    timestamp: 1413496405
});

goreact.on('authorize::success', function(evt, widget) {...});

goreact.on('authorize::error', function(evt, widget) {...});
```

###goreact.record( options )

Loads a recording widget.

**title : String** 

*Optional.* Name of the recording. Will display in widget and show up in the list with title.

**container : &lt;body> / DOM / Style** 

*Optional.* The container indicates where to load the widget. There are three options available:

1. **Default:** &lt;body> tag.
2. **DOM element:** serves as a container. The element controls the dimensions of the widget. Having the size defined either through width / height or absolute positioning is recommended.
3. **Style:** Object that sets the style of the container created by GoREACT. This container acts like the default with the exception that you can set the dimensions, or any other property on the container.


###goreact.upload( options )

Loads an upload widget.

**title : String** 

*Optional.* Name of the recording. Will display in widget and show up in the list with title.

**container : &lt;body> / DOM / Style** 

*Optional.* The container indicates where to load the widget. There are three options available:

1. **Default:** &lt;body> tag.
2. **DOM element:** serves as a container. The element controls the dimensions of the widget. Having the size defined either through width / height or absolute positioning is recommended.
3. **Style:** Object that sets the style of the container created by GoREACT. This container acts like the default with the exception that you can set the dimensions, or any other property on the container.

###goreact.list( options )

Loads a widget listing recorded videos.

**container : &lt;body> / DOM / Style** 

*Optional.* The container indicates where to load the widget. There are three options available:

1. **Default:** &lt;body> tag.
2. **DOM element:** serves as a container. The element controls the dimensions of the widget. Having the size defined either through width / height or absolute positioning is recommended.
3. **Style:** Object that sets the style of the container created by GoREACT. This container acts like the default with the exception that you can set the dimensions, or any other property on the container.

###goreact.playback( options )

Loads a playback widget to play a particular session.

**goreact_id : String** 

This ID is used to load the media and its dependencies in the recording widget.

**container : &lt;body> / DOM / Style** 

*Optional.* The container indicates where to load the widget. There are three options available:

1. **Default:** &lt;body> tag.
2. **DOM element:** serves as a container. The element controls the dimensions of the widget. Having the size defined either through width / height or absolute positioning is recommended.
3. **Style:** Object that sets the style of the container created by GoREACT. This container acts like the default with the exception that you can set the dimensions, or any other property on the container.

###goreact.collaborate( options )

Loads a widget to invoke reviewing and feedback of a video.

**goreact_id : String** 

This ID is used to load the media and its dependencies in the recording widget.

**container : &lt;body> / DOM / Style** 

*Optional.* The container indicates where to load the widget. There are three options available:

1. **Default:** &lt;body> tag.
2. **DOM element:** serves as a container. The element controls the dimensions of the widget. Having the size defined either through width / height or absolute positioning is recommended.
3. **Style:** Object that sets the style of the container created by GoREACT. This container acts like the default with the exception that you can set the dimensions, or any other property on the container.

###goreact.destroy( widgetId )

Unloads a widget by ID.

###goreact.on( event, handler )

Subscribes to events dispatched by the widgets.

Widgets can dispatch the following events:

**[widget]:ready**

Dispatched when widget is initialized and ready.

**Example**

```js
goreact.on('record::ready', function(evt, widget){
	console.log(evt, widget.id, widget.url)
});
```

**[widget]:destroyed**

Dispatched when widget has been removed from the DOM.

**Example**

```js
goreact.on('record::destroyed', function(evt, widget){
	console.log(evt, widget.id, widget.url)
});
```