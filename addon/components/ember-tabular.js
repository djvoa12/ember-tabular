import Ember from 'ember';

/**
* ## Basic Usage
* - `columns` - Controller array to setup the table headers/columns (detailed below).
  - `modelName` - for the component to make the proper request when filtering/sorting, you must pass the model type matching your Ember model structure. e.g. brand/diagram, product.
  - `record` - this is bound to the controller and is used to iterate over the table's model data.
* ### Template
  ```hbs
  {{! app/templates/my-route.hbs }}

  {{#ember-tabular columns=columns modelName="user" record=users as |section|}}
      {{#if section.isBody}}
          {{#each users as |row|}}
              <tr>
                  <td>{{row.username}}</td>
                  <td>{{row.emailAddress}}</td>
                  <td>{{row.firstName}}</td>
                  <td>{{row.lastName}}</td>
                  <td>
                      {{#link-to "index" class="btn btn-xs" role="button"}}
                          Edit
                      {{/link-to}}
                  </td>
              </tr>
          {{/each}}
      {{/if}}
  {{/ember-tabular}}
  ```
* ### Controller
* Setup the columns array, which is how the table headers are constructed, `label` is required in all cases.
  ```js
  // app/controllers/my-route.js

  export default Ember.Controller.extend({
    users: null,
    columns: [
      {
        property: 'username',
        label: 'Username',
        defaultSort: 'username',
      },
      {
        property: 'emailAddress',
        label: 'Email',
      },
      {
        property: 'firstName',
        label: 'First Name',
      },
      {
        property: 'lastName',
        label: 'Last Name',
      },
      {
        property: 'updatedAt',
        label: 'Last Updated',
        type: 'date',
      },
    ],
  });
  ```
*
* @class EmberTabular
*/
export default Ember.Component.extend({
  store: Ember.inject.service('store'),
  action: null,
  classNames: ['ember-tabular'],
  /**
  * Component will attempt to make a request to fetch the data.
  *
  * @property makeRequest
  * @type Boolean
  * @default true
  */
  makeRequest: true,
  /**
  * Used to toggle the filter row bar.
  *
  * @property showFilterRow
  * @type Boolean
  * @default false
  */
  showFilterRow: false,
  /**
  * @property sortableClass
  * @type String
  * @default 'sortable'
  */
  sortableClass: 'sortable',
  /**
  * @property tableWrapperClass
  * @type String
  * @default ''
  */
  tableWrapperClass: '',
  /**
  * @property tableClass
  * @type String
  * @default 'table-bordered table-hover'
  */
  tableClass: 'table-bordered table-hover',
  /**
  * @property paginationWrapperClass
  * @type String
  * @default ''
  */
  paginationWrapperClass: '',
  /**
  * Once the `isRecordLoaded` is determined if true and no data exists then this is displayed.
  *
  * @property tableLoadedMessage
  * @type String
  * @default 'No Data.'
  */
  tableLoadedMessage: 'No Data.',
  /**
  * Computed Property to determine the column length dependent upon `columns`.
  *
  * @property columnLength
  * @param columns {Array}
  * @return {Number}
  */
  columnLength: Ember.computed('columns', function () {
    return this.get('columns').length;
  }),

  // Allows multiple yields
  header: {
    isHeader: true,
  },
  body: {
    isBody: true,
  },
  footer: {
    isFooter: true,
  },

  /**
  * Model to be requested using `makeRequest: true`.
  *
  * @property modelName
  * @type String
  * @default null
  */
  modelName: null,
  /**
  * This is typically bound to the controller and is used to iterate over the table's model data.
  *
  * @property record
  * @type Object
  * @default null
  */
  record: null,
  /**
  * This is typically setup on the controller and passed into the component, and is used to construct the table headers/filtering.
  *
  ```js
  export default Ember.Controller.extend({
    users: null,
    columns: [
      {
        property: 'username',
        label: 'Username',
        defaultSort: 'username',
      },
      {
        property: 'emailAddress',
        label: 'Email',
      },
      {
        property: 'firstName',
        label: 'First Name',
        sort: false,
      },
      {
        property: 'isAdmin',
        label: 'Is Admin',
        list: [
          {
            label: 'Yes',
            value: true,
          },
          {
            label: 'No',
            value: false,
          }
        ],
      },
      {
        property: 'updatedAt',
        label: 'Last Updated',
        type: 'date',
      },
      {
        label: 'Actions',
      },
    ],
  });
  ```
  *
  - `columns.property` - {String}
    - Required for column filtering/sorting
    - Properties should be in camelCase format
  - `columns.label` - {String}
    - Required in all use-cases
  - `columns.type` - {String} - Default: text
    - Sets the filter `<input type="">`
  - `columns.sort` - {Boolean} - Default: `true`
    - Required for column sorting
  - `columns.list` - {Array} - Default: `null` - Filtering the column based on a dropdown list.
    - `list.label` - Displayed to the user for selection.
    - `list.value` - Value that is sent in the request.
  - `columns.defaultSort` - {String}
    - Initial sort value for API request
    - Will be overridden with any sorting changes
  *
  * @property columns
  * @type Array
  * @default null
  */
  columns: null,

  // pagination defaults
  /**
  * @property page
  * @type Number
  * @default 1
  */
  page: 1,
  /**
  * Used in request to construct pagination.
  *
  * @property limit
  * @type Number
  * @default 10
  */
  limit: 10,
  /**
  * Number passed to the pagination add-on.
  *
  * @property pageLimit
  * @type Number
  * @default 0
  */
  pageLimit: 0,
  /**
  * Used in request to construct pagination.
  *
  * @property offset
  * @type Number
  * @default 0
  */
  offset: 0,
  /**
  * @property sort
  * @type String
  * @default null
  */
  sort: null,
  /**
  * @property filter
  * @type Object
  * @default null
  */
  filter: null,
  /**
  * Object to pass in static query-params that will not change based on any filter/sort criteria.
  * Additional table-wide filters that need to be applied in all requests. Typically bound to the controller.
  ```js
  // app/controllers/location.js

  export default Ember.Controller.extend({
    staticParams: Ember.computed('model', function() {
      return {
        'filter[is-open]': '1',
        include: 'hours',
      };
    }),
    ...
  });
  ```

  ```hbs
  {{! app/templates/my-route.hbs }}

  {{#ember-tabular columns=columns modelName="user" record=users staticParams=staticParams as |section|}}
    ...
  {{/ember-tabular}}
  ```
  *
  * @property staticParams
  * @type Object
  * @default null
  */
  staticParams: null,

  // State flags
  /**
  * @property isSuccess
  * @type Boolean
  * @default false
  */
  isSuccess: false,
  /**
  * @property isFailure
  * @type Boolean
  * @default false
  */
  isFailure: false,
  /**
  * @property isLoading
  * @type Boolean
  * @default false
  */
  isLoading: false,

  /**
  * @property defaultSuccessMessage
  * @type String
  * @default 'Success!'
  */
  defaultSuccessMessage: 'Success!',
  /**
  * @property defaultFailureMessage
  * @type String
  * @default 'There was an issue. Please check below for errors.'
  */
  defaultFailureMessage: 'There was an issue. Please check below for errors.',

  // Messages
  successMessage: Ember.get(Ember.Component, 'defaultSuccessMessage'),
  failureMessage: Ember.get(Ember.Component, 'defaultFailureMessage'),

  // For pushing any per field errors
  /**
  * Conforms to json:api spec: http://jsonapi.org/format/#errors
  *
  * @property errors
  * @type Array
  * @default null
  */
  errors: null,

  /**
  * Used to serialize the parameters within `request`.
  *
  * @method serialize
  * @param params {Object} An object of query parameters.
  * @return params {Object} The serialized query parameters.
  */
  serialize(params) {
    // Serialize Pagination
    params = this.serializePagination(params);
    // Serialize Filter
    params = this.serializeFilter(params);
    // Serialize Sort
    params = this.serializeSort(params);

    return params;
  },

  /**
  * Transform params related to pagination into API expected format.
  * Follows json:api spec by default: http://jsonapi.org/format/#fetching-pagination.
  *
  * `offset` => `?page[offset]`.
  *
  * `limit` => `?page[limit]`.
  *
  * If you are not using Ember Data then you can extend this addon's component and override a set of serialize and normalized methods:
  ```js
  import EmberTabular from 'ember-tabular/components/ember-tabular';

  export default EmberTabular.extend({
    serializePagination(params) {
      // override default pagination ?page[offset]= and ?[page]limit=
      // offset and limit will be sent as ?offset= and ?limit=
      params.offset = (params.page * params.limit) - params.limit;
      if (isNaN(params.offset)) {
        params.offset = null;
      }

      return params;
    },
  });
  ```
  *
  * @method serializePagination
  * @param params {Object} An object of query parameters.
  * @return params {Object} The serialized pagination query parameters.
  */
  serializePagination(params) {
    // Override to set dynamic offset based on page and limit
    params.offset = (params.page * params.limit) - params.limit;
    if (isNaN(params.offset)) {
      params.offset = null;
    }

    // Support json api page[offset]/page[limit] spec
    params.page = {};
    params.page.limit = params.limit;
    delete params.limit;
    params.page.offset = params.offset;
    delete params.offset;

    return params;
  },

  /**
  * Transform params related to filtering into API expected format.
  * Follows json:api spec by default: http://jsonapi.org/recommendations/#filtering.
  * `?filter[lastName]` => `?filter[last-name]`.
  *
  * @method serializeFilter
  * @param params {Object} An object of query parameters.
  * @return params {Object} The serialized filter query parameters.
  */
  serializeFilter(params) {
    // serialize filter query params
    const filter = params.filter;

    for (let key in filter) {
      if (filter.hasOwnProperty(key)) {
        const value = filter[key];
        const serializedKey = this.serializeProperty(key);

        // delete unserialized key
        delete filter[key];

        key = serializedKey;
        filter[key] = value;
      }
    }

    return params;
  },

  /**
  * Transform params related to sorting into API expected format.
  * Follows json:api spec by default: http://jsonapi.org/format/#fetching-sorting.
  * `?sort=lastName` => `?sort=last-name`.
  *
  * @method serializeSort
  * @param params {Object} An object of query parameters.
  * @return params {Object} The serialized sort query parameters.
  */
  serializeSort(params) {
    params.sort = this.serializeProperty(params.sort);

    return params;
  },

  /**
  * Follows json:api dasherized naming.
  * `lastName` => `last-name`.
  *
  * If you are not supporting json:api's dasherized properties this can be extended to support other conventions:
  ```js
  import EmberTabular from 'ember-tabular/components/ember-tabular';

  export default EmberTabular.extend({
    serializeProperty(property) {
      // Override to convert all properties sent in requests to camelize instead of the default dasherized
      // ?filter[lastName]&sort=isAdmin
      // (pseudo code)
      if (property) {
        return Ember.String.camelize(property);
      }

      return null;
    },
  });
  ```
  *
  * @method serializeProperty
  * @param property {String}
  * @return property {String}
  */
  serializeProperty(property) {
    if (property) {
      return Ember.String.dasherize(property);
    }

    return null;
  },

  /**
  * Used to normalize query parameters returned from `request` to components expected format.
  *
  * @method normalize
  * @param data {Object} Data object returned from request.
  * @param params {Object} The returned object of query parameters.
  * @return data {Object}
  */
  normalize(data, params) {
    // Normalize Pagination
    data = this.normalizePagination(data, params);
    // Normalize Filter
    data.query = this.normalizeFilter(data.query);
    // Normalize Sort
    data.query = this.normalizeSort(data.query);

    return data;
  },

  /**
  * Used to normalize pagination related query parameters returned from `request` to components expected format.
  * `?page[offset]` => `offset`.
  * `?page[limit]` => `limit`.
  *
  * @method normalizePagination
  * @param data {Object} Data object returned from request.
  * @param params {Object} The returned object of query parameters.
  * @return data {Object}
  */
  normalizePagination(data, params) {
    // pagination - return number of pages
    const pageLimit = Math.ceil(data.meta.total / params.page.limit);
    // determine if pageLimit is a valid number value
    if (isFinite(pageLimit)) {
      this.set('pageLimit', pageLimit);
    } else {
      this.set('pageLimit', null);
    }

    return data;
  },

  /**
  * Used to normalize filter related query parameters returned from `request` to components expected format.
  * `?filter[last-name]` => `filter[lastName]`.
  * `?filter[user.first-name]` => `filter[user.firstName]`.
  *
  * @method normalizeFilter
  * @param query {Object} The returned object of query parameters.
  * @return query {Object}
  */
  normalizeFilter(query) {
    // normalize filter[property-key]
    // into filter[propertyKey]
    let filter = query.filter;
    for (let key in filter) {
      if (filter.hasOwnProperty(key)) {
        const value = filter[key];
        const propertySegments = this.segmentProperty(key);
        let normalizedKey;

        // handle/retain dot notation relationships `property.propertyName`
        propertySegments.forEach(function(el, i, normalizedSegments) {
          normalizedSegments[i] = this.normalizeProperty(propertySegments[i]);
        }.bind(this));

        // join segments to create normalizedProperty
        normalizedKey = propertySegments.join('.');

        // delete unserialized key
        delete filter[key];

        key = normalizedKey;
        filter[key] = value;
      }
    }

    return query;
  },

  /**
  * Used to normalize sort related query parameters returned from `request` to components expected format.
  * Expects json:api by default.
  *
  * @method normalizeSort
  * @param query {Object} The returned object of query parameters.
  * @return query {Object}
  */
  normalizeSort(query) {
    return query;
  },

  /**
  * Used to normalize properties to components expected format.
  * By default this will camelize the property.
  *
  * @method normalizeProperty
  * @param property {String}
  * @return property {String}
  */
  normalizeProperty(property) {
    if (property) {
      return Ember.String.camelize(property);
    }

    return null;
  },

  /**
  * @method segmentProperty
  * @param property {String}
  * @return segments {Array}
  */
  segmentProperty(property) {
    let segments = property.split('.');

    return segments;
  },

  /**
  * Determine if `record` is loaded using a number of different property checks.
  *
  * @property isrecordLoaded
  * @type Function
  */
  isrecordLoaded: Ember.computed('errors', 'record', 'record.isFulfilled', 'record.isLoaded',
  'modelName', function () {
    // If record array isLoaded but empty
    if (this.get('record.isLoaded')) {
      return true;
    }
    // If record.content array loaded is empty
    if (this.get('record.isFulfilled')) {
      return true;
    }
    // If errors
    if (this.get('errors')) {
      return true;
    }
    // If record array is empty
    if (this.get('record') && this.get('record').length === 0) {
      return true;
    }
    // Show custom tableLoadedMessage
    if (this.get('record') === null && this.get('modelName') === null) {
      return true;
    }

    return false;
  }),

  /**
  * Used in templates to determine if table header will allow filtering.
  *
  * @property isColumnFilters
  * @type Boolean
  * @return {Boolean}
  * @default false
  */
  isColumnFilters: Ember.computed('columns', function () {
    const columns = this.get('columns');

    for (let i = columns.length - 1; i >= 0; i--) {
      if (columns[i].hasOwnProperty('property')) {
        return true;
      }
    }

    return false;
  }),

  /**
  * Runs on init to setup the table header default columns.
  *
  * @method setColumnDefaults
  */
  setColumnDefaults: Ember.on('init', function () {
    this.get('columns').map(function (column) {
      // if column does not have a sort property defined set to true
      if (!column.hasOwnProperty('sort')) {
        Ember.set(column, 'sort', true);
      }
      // if column does not have a type property defined set to text
      if (!column.hasOwnProperty('type')) {
        Ember.set(column, 'type', 'text');
      }
    });
  }),

  /**
  * Runs on init to set the default sort param.
  *
  * @method defaultSort
  */
  defaultSort: Ember.on('init', function () {
    this.get('columns').map(function (el) {
      if (el.hasOwnProperty('defaultSort')) {
        this.set('sort', el.defaultSort);
      }
    }.bind(this));
  }),

  /**
  * Constructs the query object to be used in `request`.
  *
  * @property query
  * @type Object
  * @return {Object}
  */
  query: Ember.computed('page', 'limit', 'offset', 'sort', 'filter.@each.value',
  'staticParams', function () {
    let query = {};
    const filter = this.get('filter') || [];
    query = {
      page: this.get('page'),
      limit: this.get('limit'),
      offset: this.get('offset'),
      sort: this.get('sort'),
      filter: filter.reduce((memo, filter) => Ember.merge(memo, {
        [filter.field]: filter.value,
      }), {}),
    };

    // Merge staticParams/query into query
    Ember.merge(query, this.get('staticParams'));

    return query;
  }),

  /**
  * Make request to API for data.
  *
  * @method request
  * @param params {Object} Serialized query parameters.
  * @param modelName {String}
  */
  request(params, modelName) {
    params = this.serialize(params);

    return this.get('store').query(modelName, params).then(
      function (data) {
        if (!this.isDestroyed || !this.isDestroying) {
          data = this.normalize(data, params);
          this.set('isLoading', false);
          this.set('record', data);
        }
      }.bind(this),
      function (errors) {
        if (!this.isDestroyed || !this.isDestroying) {
          this.failure(errors);
        }
      }.bind(this)
    );
  },

  /**
  * Sets the `record` after the `request` is resolved.
  *
  * @method setModel
  */
  setModel: Ember.on('init', Ember.observer('query', 'makeRequest', function () {
    Ember.run.once(this, function () {
      // If makeRequest is false do not make request and setModel
      if (this.get('makeRequest')) {
        this.reset();
        this.set('isLoading', true);
        const modelName = this.get('modelName');
        const params = this.get('query');

        return this.request(params, modelName);
      }
    });
  })),

  actions: {
    sortBy(property) {
      this.setSort(property);
      this.updateSortUI(property);
    },
    toggleFilterRow() {
      this.toggleProperty('showFilterRow');
    },
  },

  /**
  * Sets the active sort property.
  *
  * @method setSort
  * @param sortProperty {String}
  */
  setSort: Ember.on('didInsertElement', function (sortProperty) {
    if (this.get('sort') || sortProperty) {
      let property;

      if (sortProperty) {
        property = sortProperty;
      } else {
        property = this.get('sort').replace(/^-/, '');
        // Must be the opposite of property
        sortProperty = `-${property}`;
      }

      property = property;

      if (this.get('sort') === sortProperty) {
        this.set('sort', `-${property}`);
      } else {
        this.set('sort', property);
      }
    }
  }),

  /**
  * Sets the proper classes on table headers when sorting.
  *
  * @method updateSortUI
  * @param sortProperty {String}
  */
  updateSortUI: Ember.on('didInsertElement', function (sortProperty) {
    if (this.get('sort') || sortProperty) {
      const _this = this;
      const $table = this.$();
      const sort = this.get('sort');
      let property,
        classProperty,
        $tableHeader;

      // convert property to camelCase
      property = sort.replace(/^-/, '');
      // convert relationships
      classProperty = property.replace(/\./g, '-');
      $tableHeader = Ember.$(`#${classProperty}`);

      // Remove all classes on th.sortable but sortable class
      $table.find('th').removeClass(function (i, group) {
        const list = group.split(' ');
        return list.filter(function (val) {
          return (val !== _this.get('sortableClass') && val !== 'filterable');
        }).join(' ');
      });

      if (sort.charAt(0) === '-') {
        $tableHeader.addClass('sort-desc');
      } else {
        $tableHeader.addClass('sort-asc');
      }
    }
  }),

  /**
  * @method failure
  * @param response {Object}
  */
  failure(response) {
    this.reset();
    this.setProperties({
      isFailure: true,
      pageLimit: null,
    });

    // Set per field errors if found
    if ('errors' in response) {
      this.set('errors', response.errors);
    }
  },

  /**
  * Resets all state specific properties.
  *
  * @method reset
  */
  reset() {
    this.setProperties({
      isLoading: false,
      errors: null,
      isSuccess: false,
      isFailure: false,
      successMessage: this.get('defaultSuccessMessage'),
      failureMessage: this.get('defaultFailureMessage'),
    });
  },
});