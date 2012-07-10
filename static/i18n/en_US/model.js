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
  instance: {
    instance_of: 'Instance of %s'
  }
};
