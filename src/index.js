import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@babel/standalone';

window.RemoteComponent = {
  createRemoteComponent: function (url) {
    return fetch(url)
      .then(response => response.text())
      .then(code => {
        const transformedCode = Babel.transform(code, {
          presets: ['env', 'react']
        }).code;
        eval(transformedCode);
        return new Promise((resolve, reject) => {
          if (window.Project2Component) {
            resolve(window.Project2Component.default);
          } else {
            reject(new Error('Component not available'));
          }
        });
      });
  },
  createUseRemoteComponent: function () {
    return function (url) {
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [Component, setComponent] = useState(null);

      useEffect(() => {
        if (url) {
          window.RemoteComponent.createRemoteComponent(url)
            .then(component => {
              setComponent(() => component);
              setLoading(false);
            })
            .catch(err => {
              setError(err);
              setLoading(false);
            });
        }
      }, [url]);

      return [loading, error, Component];
    };
  }
};

const useRemoteComponent = window.RemoteComponent.createUseRemoteComponent();
const project2Url = "http://localhost:1235/project2.js"; 

const App = () => {
  const [showProject2, setShowProject2] = useState(false);
  const [loading, error, Project2Component] = useRemoteComponent(showProject2 ? project2Url : null);

  const handleLoadChild = () => setShowProject2(true);

  return (
    <div>
      <h2>Parent</h2>
      <button onClick={handleLoadChild}>Load Child</button>
      {showProject2 && loading && <p>Loading...</p>}
      {showProject2 && error && <p>Error: {error.message}</p>}
      {showProject2 && !loading && Project2Component && <Project2Component />}
    </div>
  );
};

const container = document.getElementById('root');
ReactDOM.render(<App />, container);
