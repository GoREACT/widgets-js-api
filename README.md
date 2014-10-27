GoREACT Widget JavaScript API
===
GoREACT's Widget JavaScript API is a lightweight library for interfacing with GoREACT widgets.

######Paste the following code
---

Paste the following code on to each page of you site you would like to access GoREACT widgets. For single-page applications, only paste it once on the main index page.

	!function(){function a(a){var c=[];c.methods=a.split(" "),c.factory=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),c.push(b),c}};for(var d=0;d<c.methods.length;d++){var e=c.methods[d];c[e]=c.factory(e)}var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(b,f),window["goreact"]=c}var b=document.createElement("script");b.type="text/javascript",b.async=!0,b.src="../build/widgets.js",a("init on destroy record upload playback collaborate list")}();

######Initialization
---

###goreact.init( settings )

Used to initialize GoReact and validate user. This function must be called and completed before any other API calls are made.

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

#####Example

	<script>
	goreact.init({
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
    </script>

####goreact.record( options )

Loads a recording widget.

####goreact.upload( options )

Loads an upload widget.

####goreact.list( options )

Loads a widget listing recorded videos.

####goreact.playback( options )

Loads a playback widget to play a particular session.

####goreact.collaborate( options )

Loads a widget to invoke reviewing and feedback of a video.

####goreact.destroy( options )

Unloads a widget by ID.

####goreact.on( event, handler )

Subscribes to events dispatched by the widgets.
