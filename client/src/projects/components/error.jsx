import React from "react"
export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      this.setState({ hasError: true });
        
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.onClose != nextProps.onClose && this.state.hasError) {
            this.props.close()
        }
    }
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>This page couldn't load properly. Please check console for details.</h1>;
      }
      return this.props.children;
    }
  }