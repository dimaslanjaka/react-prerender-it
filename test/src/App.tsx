import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import { AdsElement } from './components/adsense/Adsense';
import { OutboundLink } from './components/OutboundLink';
import pages from './data.json';
import logo from './logo.svg';

interface HomeProps {
  children?: JSX.Element;
}
function Home(props: HomeProps) {
  document.title = 'Homepage - React for github pages';
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <OutboundLink
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </OutboundLink>

        <div>{props.children}</div>

        <div className="adsw">
          <AdsElement
            id="ads1"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            client="ca-pub-2188063137129806"
            slot="8481296455"
          />
        </div>
      </header>
    </div>
  );
}

function PageItem(props: typeof pages[number]) {
  document.title = `${props.name} ${props.id} - React for github pages`;
  return (
    <div className="page">
      <div>
        <Link to="/">Go Back</Link>
      </div>
      <div>ID: {props.id}</div>
      <div>
        <pre>
          <code>{JSON.stringify(props, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

function App() {
  const routes = (
    <Routes>
      {pages.map((page) => {
        const pathname = '/page/' + page.id + '.html';
        //console.log(pathname);
        return (
          <Route
            key={page.id}
            path={pathname}
            element={<PageItem {...page} />}
          ></Route>
        );
      })}
    </Routes>
  );
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Footer />
      {routes}
      {/** default not found and index to homepage */}
      <Routes>
        <Route
          path="/"
          element={
            <Home>
              {getRoutes(routes)
                .map((str) => {
                  return <Link to={str}>{str}</Link>;
                })
                .reduce((prev, curr) => (
                  <>
                    {prev} <br /> {curr}
                  </>
                ))}
            </Home>
          }
        ></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function Footer() {
  return (
    <footer>
      <span>Source: </span>
      <a href="https://github.com/dimaslanjaka/react-gh-pages">
        https://github.com/dimaslanjaka/react-gh-pages
      </a>
    </footer>
  );
}

export default App;

/**
 * Get list of paths
 * @param routes
 */
function getRoutes(routes: JSX.Element) {
  const paths: any[] = [];
  /**
   * Walk in list of routes tree
   * @param element
   */
  const walkTree = (element: JSX.Element) => {
    if (element.props.children && element.props.children.length > 0) {
      element.props.children.forEach((elem: JSX.Element) => walkTree(elem));
    } else if (element.props.path && typeof element.props.path === 'string') {
      paths.push(element.props.path);
    }
  };
  walkTree(routes);
  return paths;
}
