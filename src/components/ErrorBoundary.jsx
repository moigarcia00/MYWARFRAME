import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="state-msg state-error error-boundary">
        <p>Algo salió mal al mostrar esta sección.</p>
        <p className="error-boundary-detail">
          {this.state.error?.message || 'Error desconocido'}
        </p>
        <div className="error-boundary-actions">
          <button className="btn-mostrar" onClick={this.handleRetry}>
            Reintentar
          </button>
          <button className="btn-mostrar" onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
