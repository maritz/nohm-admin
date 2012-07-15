module.exports = {
  general: {
    forms: {
      errors: {
      },
      labels: {
      },
      submit: "Submit"
    },
    id: 'ID',
    properties: "Properties",
    version: "Hash of definition",
    property: {
      name: "Name",
      type: "Type",
      value: "Value",
      defaultValue: "Default value",
      index: "Indexed",
      unique: "Unique",
      validations: "Validations",
      actions: 'Actions'
    }
  },
  details: {
    idGenerator: "Id generator",
    cardinality: "Number of instances",
    instance_plural: "Instances",
    load_instances: "Load instances (might take a second or two)"
  },
  instance_list: {
    search: "Search",
    reset: "Reset",
    no_instances: "No instances found."
  },
  instance: {
    instance_of: "Instance of %s",
    property: {
      value: "Typecasted value",
      value_raw: "Raw DB value"
    },
    no_relations: "This model does not have any relations. It is lonely and quite possibly a little sad.",
    relations: "Relations",
    related_name: "To model \"%s\"",
    relation_name: "%s",
    actions: "Instance actions",
    edit: "Edit",
    unlink: "Unlink",
    remove: "Remove",
    link: "Link",
    fix_index: "Fix indices/uniques"
  },
  version_warning_overlay: {
    text: "This instance was saved with a model definition that is not identical to that of the last saved instance of this model.<br/>\
          Inconsitencies may arise from this the next time this instance is loaded or saved.<br/>\
          Check the instance properties for errors.<br/>\
          <br/>\
          If you are sure that the current model is compatible with the latest model definition, press \"Overwrite\"",
    overwrite: "Overwrite"
  },
  version_error_overlay: {
    text: "The property \"%s\" is not present in the current model definition anymore.<br/><br/>If this is not intentional, press \"Remove\" to remove it from the hash in the database.",
    remove: "Remove"
  },
  remove_overlay: {
    text: "This will remove the instance completely from the database.<br/><br/>You cannot reverse this unless you have backups and can roll back.",
    remove: "Remove"
  },
  edit_property: {
    header: "Edit property",
    text: "You can edit the property in two write modes: raw or typecasted.<br/>\
        <b>Raw</b>: The value is written directly to the database, no changes, no indexing, no unique locks.<br/>\
        <b>Typecasted</b>: The value is given to the models .p() method and typecasting and validation are applied and indexes and unique locks are created.",
    forms: {
      labels: {
        value: "Value",
        mode: "Write mode",
        raw: "Raw",
        typecasted: "Typecasted"
      },
      submit: "Edit"
    }
  }
};
