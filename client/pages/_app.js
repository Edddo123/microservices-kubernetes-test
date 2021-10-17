import "bootstrap/dist/css/bootstrap.css";
import BuildClient from "../api/build-client";
import Header from "../components/header";
// importing global css

// so when we defining files in page directory nextjs imports them inside its default app component and runs like that. so we define our _app custom wrapper and now everything imported here becomes global
// Component here is export defaulted components of pages like index, banana and pageProps are components passed to those components
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
      <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

// so instead of refetching current user here and also on each page where we had separately called current user with their own get initial props, we will just pass it down from app component

AppComponent.getInitialProps = async (appContext) => {
  // so unlike page components, custom app component gets different context object in getInitialProps
  // console.log(Object.keys(appContext));

  const client = BuildClient(appContext.ctx); // thats where req is saved here
  const { data } = await client.get("/api/users/currentuser");
  let pageProps = {};
  console.log(appContext.Component);
  if (appContext.Component.getInitialProps) {
    // not every page has getInitialProps so we have to check it
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser); // so instead of calling build client and in case we need currentUser info in getIntial props of child components, we will provide it them arguments to getInitialProps invocation
  }
  console.log(data);
  return {
    pageProps,
    // currentUser: data.currentUser, or
    ...data,
  };
};

export default AppComponent;

// So we have to know current user on every page and also we have to add header on every page so we can write it out in _app component which will pass it down to all pages. However when invoking getIntialProps on app, all other specific getInitialProps of other pages dont get invoked, so we invoke that function manually, that index pages getInitialProps will be available at appContext.Component.getInitialProps and we pass it down same context argument which is available inside ctx object
