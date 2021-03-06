//
// Copyright (c) 2011 (MIT License)
//    Maxwell Krohn <max@okcupid.com>
//    HumorRainbow, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//-----------------------------------------------------------------------
//
// Functions to support the tame runtime!  Needs to required in every tame-
//   generated file. All are core, except for Rendezvous, which isn't
//   core, but is quite useful.
//
//-----------------------------------------------------------------------

function callChain (l) {
    if (l.length) {
	var first = l.shift ();
	first (function () { callChain (l); });
    }
};

//-----------------------------------------------------------------------

function end () {}

//-----------------------------------------------------------------------

function copy (from, to) {
    for (var i in from) { 
	to[i] = from[i]; 
    }
}

//-----------------------------------------------------------------------

function Rendezvous () {
    this._completed = [];
    this._waiters = [];


    //==================================================

    // The public interface has two methods --- mkev, and wait.
    // We don't call it mkevent, so as not to use a keyword. 
    // Also note that variadic return is the only possibility here.

    this.mkev = function (id, dest) {
	this._count ++;
	var x = this;
	return (function () { copy (arguments, dest); x._trigger (id); });
    };

    this.wait = function (ev) {
	if (this._completed.length) {
	    var x = this._completed.shift ();
	    ev (x);
	} else {
	    this._waiters.push (ev);
	}
    };

    //==================================================

    this._trigger = function (id) {
	if (this._waiters.length) {
	    var x = this._waiters.shift ();
	    x (id);
	} else {
	    this._completed.push (id);
	}
    };

    return this;
};

//-----------------------------------------------------------------------

function args2arr (from) {
    var to = [];
    copy (from, to);
    return to;
};

//-----------------------------------------------------------------------

function assign (source, dest) {
    if (typeof (dest) == "object" && 
	dest &&
	dest.constructor == Array && 
	dest.length == 0) {
	return args2arr (source);
    } else {
	return source[0];
    }
};

//-----------------------------------------------------------------------

function Event (k) {
    this._count = 1;
    this._continuation = k;
    this.trigger = function () {
	this._count--;
	if (this._count == 0) {
	    this._continuation ();
	}
    };
    this.mkevent = function (assign_fn) {
	this._count++;
	var x = this;
	return (function () { 
	    if (assign_fn) {
		assign_fn (arguments); 
	    } 
	    x.trigger (); 
	});
    };
    return this;
};

//-----------------------------------------------------------------------

function noop (k) { k(); };

//-----------------------------------------------------------------------

var runtime = {
    callChain : callChain,
    end : end,
    noop : noop,

    Event : Event,
    Rendezvous : Rendezvous,
    assign : assign

};

//-----------------------------------------------------------------------

exports.runtime = runtime;
