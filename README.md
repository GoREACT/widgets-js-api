GoREACT Widget JavaScript API
===
GoReact's Widget JavaScript API is a lightweight library for interfacing with GoReact widgets.

##Paste the following code

	!function(){function a(a){var c=[];c.methods=a.split(" "),c.factory=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),c.push(b),c}};for(var d=0;d<c.methods.length;d++){var e=c.methods[d];c[e]=c.factory(e)}var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(b,f),window["goreact"]=c}var b=document.createElement("script");b.type="text/javascript",b.async=!0,b.src="widgets-dot.js",a("init ready record upload playback collaborate list")}();

##Initialization
---

###goreact.init( settings )

Used to initialize GoReact and validate user. This function must be called and completed before any other API calls are made.

####Required params
---

#####api_key : String 

Key used as to interface with GoReact's JavaScript API.

#####user_id : Number or String 

The ID of the current authenticated user.

#####first_name : String 

The first name of the current authenticated user.

#####last_name : String 

The last name of the current authenticated user.

#####email : String 

The email address of the current authenticated user.

#####context_id : String 

The id of the context which represents the scope of a given set of videos

#####context_name : String

The name of the context which represents the scope of a given set of videos

#####context_role : Enum ("instructor", "reviewer", "presenter")

The role of the context

####Optional params
---

#####expires : UTC timestamp

It will expire the signature at the given time. If not provided, *signature will not expire*?

####Example

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


