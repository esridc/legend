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
      this._classRemoveEventListeners('click', 'legend-edit-layer', '_onLayerEdit' );
      this._classEventBuilder('click', 'legend-edit-layer', '_onLayerEdit' );
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
    //if can remove layer, add option to UI
    var editable = ( this.state.editable ) ? 'block' : 'none';
    var title = this._formatTitle(layer.name);

    var item = this._createElement('div', el, layer.id, '', 'legend-item');
    this._createElement('div', item, 'title-'+layer.id, title, 'legend-title');
    
    var editor = this._createElement('div', item, 'edit-tools-'+layer.id, '', 'legend-edit-tools');
    editor.style.display = editable;

    //create editor elements 
    this._createElement('div', editor, 'close-'+layer.id, '&#x2715;', 'legend-tool legend-remove-layer');
    this._createElement('div', editor, 'edit-'+layer.id, '&#x270E;', 'legend-tool legend-edit-layer');

    if ( !blockEventing ) {
      this._classRemoveEventListeners('click', 'legend-remove-layer', '_onRemoveLayer' );
      this._classEventBuilder('click', 'legend-remove-layer', '_onRemoveLayer' );
      this._classRemoveEventListeners('click', 'legend-edit-layer', '_onLayerEdit' );
      this._classEventBuilder('click', 'legend-edit-layer', '_onLayerEdit' );
    }
  }



  Legend.prototype.disableEdit = function() {
    this.state.editable = false;
    
    var items = document.getElementsByClassName( 'legend-edit-tools' );
    for(var i=0;i<items.length;i++){
      items[i].style.display = 'none';
    }

  }


  Legend.prototype.enableEdit = function() {
    this.state.editable = true;

    var items = document.getElementsByClassName( 'legend-edit-tools' );
    for(var i=0;i<items.length;i++){
      items[i].style.display = 'block';
    }
  }



  Legend.prototype._formatTitle = function(title) {
    title = title.replace(/_/g, ' ');

    return title;
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
    el.classList.add('removing');
    setTimeout(function() {
      el.parentNode.removeChild(el);
    },400);

    //remove from layers list 
    this.layers.forEach(function(layer, i) {
      if ( layer.id === id ) { self.layers.splice(i, 1); }
    });

    //emit removal event
    this.emit('remove-layer', id);
  }



  Legend.prototype.editLayer = function(e) {
    var id = e.target.id.replace(/edit-/, '');
    var el = document.getElementById(id);
    var selected = false; 
    
    if ( el.classList.contains('selected') ) {
      selected = true;
    }

    var items = document.getElementsByClassName( 'legend-item' );
    for(var i=0;i<items.length;i++){
      items[i].classList.remove('selected');
    }

    if ( !selected ) {
      el.classList.add('selected');
      this.emit('edit-layer', id);
    } else {
      this.emit('edit-layer-end', id);
    }
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

  Legend.prototype._onLayerEdit = function(e) {
    this.editLayer(e);
  }


  window.Legend = Legend;

})(window);