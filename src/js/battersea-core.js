/**
 * Battersea Library - Core
 * Version: 2.0.0
 * Core initialization and component management
 * 
 * Dependencies: battersea-utils.js
 */

(function(window, document) {
  'use strict';

  // Check for required dependencies
  if (!window.BatterseaUtils) {
    console.error('Battersea Core requires BatterseaUtils. Please include battersea-utils.js before battersea-core.js');
    return;
  }

  const Utils = window.BatterseaUtils;

  // Main Battersea object
  const Battersea = {
    version: '2.0.0',
    components: {},
    instances: {},
    observer: null,
    initialized: false,

    /**
     * Register a component
     */
    register: function(name, ComponentClass, selector) {
      if (this.components[name]) {
        console.warn(`Component "${name}" is already registered. Overwriting.`);
      }
      
      this.components[name] = {
        Class: ComponentClass,
        selector: selector,
        instances: []
      };

      console.log(`Battersea: Registered component "${name}"`);

      // If already initialized, init this component immediately
      if (this.initialized) {
        this.initComponent(name);
      }
    },

    /**
     * Initialize a specific component
     */
    initComponent: function(name) {
      const component = this.components[name];
      if (!component) {
        console.warn(`Component "${name}" not found`);
        return;
      }

      const elements = Utils.qsa(component.selector);
      console.log(`Found ${elements.length} ${name} elements`);

      elements.forEach(el => {
        // Check if already initialized
        const instanceId = Utils.getData(el, 'battersea-instance');
        if (instanceId) {
          return; // Already initialized
        }

        try {
          const instance = new component.Class(el);
          const id = Utils.generateId(name);
          Utils.setData(el, 'battersea-instance', id);
          component.instances.push({ id, instance, element: el });
        } catch (error) {
          console.error(`Error initializing ${name}:`, error);
        }
      });
    },

    /**
     * Initialize all registered components
     */
    init: function() {
      if (this.initialized) {
        console.log('Battersea: Re-initializing components');
      } else {
        console.log('Battersea: Initializing components');
        this.initialized = true;
      }

      // Initialize each registered component
      Object.keys(this.components).forEach(name => {
        this.initComponent(name);
      });

      console.log('Battersea: Initialization complete');
    },

    /**
     * Setup MutationObserver for dynamic content
     */
    setupObserver: function() {
      if (!('MutationObserver' in window)) {
        console.warn('MutationObserver not supported, dynamic content detection disabled');
        return;
      }

      if (this.observer) {
        return; // Already setup
      }

      this.observer = new MutationObserver(Utils.debounce(() => {
        console.log('Battersea: DOM mutation detected, re-initializing');
        this.init();
      }, 100));

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('Battersea: MutationObserver setup complete');
    },

    /**
     * Destroy a specific instance
     */
    destroyInstance: function(element) {
      const instanceId = Utils.getData(element, 'battersea-instance');
      if (!instanceId) return;

      // Find and destroy the instance
      Object.keys(this.components).forEach(name => {
        const component = this.components[name];
        const index = component.instances.findIndex(inst => inst.id === instanceId);
        
        if (index !== -1) {
          const instance = component.instances[index];
          if (instance.instance && typeof instance.instance.destroy === 'function') {
            instance.instance.destroy();
          }
          component.instances.splice(index, 1);
          element.removeAttribute('data-battersea-instance');
        }
      });
    },

    /**
     * Destroy all instances of a component
     */
    destroyComponent: function(name) {
      const component = this.components[name];
      if (!component) return;

      component.instances.forEach(inst => {
        if (inst.instance && typeof inst.instance.destroy === 'function') {
          inst.instance.destroy();
        }
        if (inst.element) {
          inst.element.removeAttribute('data-battersea-instance');
        }
      });

      component.instances = [];
    },

    /**
     * Destroy all components
     */
    destroy: function() {
      Object.keys(this.components).forEach(name => {
        this.destroyComponent(name);
      });

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.initialized = false;
      console.log('Battersea: All components destroyed');
    },

    /**
     * Refresh/reinitialize all components
     */
    refresh: function() {
      console.log('Battersea: Refreshing all components');
      this.init();
    },

    /**
     * Get instance from element
     */
    getInstance: function(element) {
      const instanceId = Utils.getData(element, 'battersea-instance');
      if (!instanceId) return null;

      for (let name in this.components) {
        const found = this.components[name].instances.find(inst => inst.id === instanceId);
        if (found) return found.instance;
      }

      return null;
    }
  };

  // Auto-initialize on DOM ready
  function initializeBattersea() {
    Battersea.init();
    Battersea.setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBattersea);
  } else {
    // DOM already loaded
    initializeBattersea();
  }

  // Expose to window
  window.Battersea = Battersea;

})(window, document);
