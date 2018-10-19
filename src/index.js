import { twigFunctions } from './TwigFunctions';
import { setOptions } from '@storybook/addon-options';
import pathParse from 'path-parse';


export const AddStories = (templateFiles, templateData) => {

  templateFiles.keys().forEach(pathName => {
    let dir = pathParse(pathName).dir.split('/').pop();
    const name = pathParse(pathName).name;

    if (!templateData) {
      storiesOf(dir, module)
        .add(name, () => templateFiles(pathName));
      return;
    }

    const extPos = pathName.lastIndexOf('.');
    const jsonFilename = pathName.substr(0, extPos < 0 ? path.length : extPos) + ".json";
    let data = [];

    if (templateData.keys().indexOf(jsonFilename) >=  0) {
      data = templateData(jsonFilename);
    }
    // Import any files specified in the root `@import` property
    if (data['@import']) {
      Object.keys(data['@import']).forEach(function(key) {
        const pathName = data['@import'][key];
        const subData = {};
        subData[key] = templateData('./' + pathName);
        data = Object.assign({}, subData, data);
      });

      Object.keys(data).map(key => {
        Object.keys(twigFunctions).map(name => {
          if (key === name) {
            data[key] = twigFunctions[name];
          }
        })
      });

      const template = templateFiles(pathName);
      const html = template(data);

      if (dir === '.') dir = 'root';
      storiesOf(dir, module)
        .add(name, () => html);
    }
  });
}