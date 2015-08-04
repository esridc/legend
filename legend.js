//! legend.js
//! version : 0.01
//! author : Brendan Heberton
//!license : MIT 
(function(window){
  'use strict';

  var Legend = function Legend( container, options ) {
    console.log('init Legend, options: ', options);
    var self = this;

    //store options 
    this.options = options;

    //UI defaults 
    this.width = options.width || 239;
    this.height = options.height || 'auto';
    this.container = container;
    this._handlers = {};
    this.state = {};
    this.state.editable = options.editable || false;

    this.layers = options.layers || [];
    
    this._buildUI(); 

    if ( this.layers.length ) {
      this.layers.forEach(function(layer) {
        self.addLayer(layer, true);
      });
      this._classRemoveEventListeners('click', 'legend-remove-layer', '_onRemoveLayer' );
      this._classEventBuilder('click', 'legend-remove-layer', '_onRemoveLayer' );
    }

  }

  Legend.prototype._buildUI = function() {

    var container = document.getElementById( this.container );
    var innerContainer = document.createElement( 'div' );
    container.appendChild( innerContainer ).id = 'legend-component';

    //var header = document.createElement( 'div' );
    //innerContainer.appendChild( header ).id = 'open-search-header';
    //header.innerHTML = 'Legend';

    var content = document.createElement( 'div' );
    innerContainer.appendChild( content ).id = 'legend-component-content';

  }




  Legend.prototype.addLayer = function(layer, blockEventing) {
    console.log('add layer: ', layer);
    var el = document.getElementById( 'legend-component-content' );
    
    var item = this._createElement('div', el, layer.id, '', 'legend-item');
    this._createElement('div', item, 'title-'+layer.id, layer.name, 'legend-title');

    //if can remove layer, add option to UI
    var editable = ( this.state.editable ) ? 'enabled' : 'disabled';
    this._createElement('div', item, 'close-'+layer.id, '&#x2715;', 'legend-remove-layer '+editable);

    if ( !blockEventing ) {
      this._classRemoveEventListeners('click', 'legend-remove-layer', '_onRemoveLayer' );
      this._classEventBuilder('click', 'legend-remove-layer', '_onRemoveLayer' );
    }
  }



  Legend.prototype.disableRemove = function() {
    this.state.editable = false;
    var editable = ( this.state.editable ) ? 'enabled' : 'disabled';
    var items = document.getElementsByClassName( 'legend-remove-layer' );
    
    for(var i=0;i<items.length;i++){
      items[i].classList.remove('enabled');
      items[i].classList.add('disabled');
    }

  }


  Legend.prototype.enableRemove = function() {
    this.state.editable = true;
    var editable = ( this.state.editable ) ? 'enabled' : 'disabled';
    var items = document.getElementsByClassName( 'legend-remove-layer' );
    
    for(var i=0;i<items.length;i++){
      items[i].classList.remove('disabled');
      items[i].classList.add('enabled');
    }
  }



  /*
  * creates a generic element, and appends to 'parent' div 
  * @param {String}   type of HTML element to create 
  * @param {String}   parent element to append created element to 
  * @param {String}   id of newly created element 
  * @param {String}   any text one wishes to append to new element 
  * @param {String}   optional classname for new element 
  */
  Legend.prototype._createElement = function(type, parent, id, html, className ) {

    var el = document.createElement( type ); 
    parent.appendChild( el ).id = id;
    el.innerHTML = html;
    document.getElementById( id ).className = className;

    return el;
  }




  /*
  * Event builder for classes 
  * @param {String}     eventName, type of event 
  * @param {String}     className, what element class are we binding to
  * @param {String}     fnName, what action (function to call) when event fires 
  *
  */
  Legend.prototype._classEventBuilder = function(eventName, className, fnName ) {
    var self = this; 
    
    var linkEl = document.getElementsByClassName( className );
    for(var i=0;i<linkEl.length;i++){
      if(linkEl[i].addEventListener){
        linkEl[i].addEventListener( eventName , function(e) { self[ fnName ].call(self, e) });
      } else {
        linkEl[i].attachEvent('on'+eventName, function(e) { self[ fnName ].call(self, e) });
      }
    }

  }



  Legend.prototype._classRemoveEventListeners = function(eventName, className, fnName ) {
    var self = this; 

    
    var linkEl = document.getElementsByClassName( className );
    for(var i=0;i<linkEl.length;i++){
      if(linkEl[i].removeEventListener){
        console.log('remove me!');
        linkEl[i].removeEventListener( eventName , function(e) { self[ fnName ].call(self, e) });
      }
    }

  }



  /*
  * Event builder for ids 
  * @param {String}     eventName, type of event 
  * @param {String}     id, what element are we binding to
  * @param {String}     fnName, what action (function to call) when event fires 
  *
  */
  Legend.prototype._idEventBuilder = function(eventName, id, fnName ) {
    var self = this; 
    
    var linkEl = document.getElementById( id );
    if(linkEl.addEventListener){
      linkEl.addEventListener(eventName, function(e) { self[ fnName ].call(self, e) });
    } else {
      linkEl.attachEvent('on'+eventName, function(e) { self[ fnName ].call(self, e) });
    }

  }



  Legend.prototype.removeLayer = function(e) {
    var self = this;

    var id = e.target.id.replace(/close-/, '');
    console.log('remove id', id);
    
    //remove from dom
    var el = document.getElementById(id);
    el.parentNode.removeChild(el);

    //remove from layers list 
    this.layers.forEach(function(layer, i) {
      if ( layer.id === id ) { self.layers.splice(i, 1); }
    });

    //emit removal event
    this.emit('remove-layer', id);
  }



  /************* EVENTS **************/

  /*
  * Register Malette events 
  * 
  */
  Legend.prototype.on = function(eventName, handler){
    this._handlers[ eventName ] = handler; 
  };


  // trigger callback 
  Legend.prototype.emit = function(eventName, val) {
    if (this._handlers[ eventName ]){
      this._handlers[ eventName ](val);
    }
  };


  Legend.prototype._onRemoveLayer = function(e) {
    this.removeLayer(e);
  }


  window.Legend = Legend;

})(window);