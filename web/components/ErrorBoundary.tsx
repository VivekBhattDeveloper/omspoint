import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  previousChildren: ReactNode;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      previousChildren: props.children,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  componentWillUnmount() {
    // Clean up event listeners and timeouts
    window.removeEventListener("unhandledrejection", this.handlePromiseRejection);
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Reset error state when children change
    if (state.previousChildren !== props.children && state.hasError) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        previousChildren: props.children,
      };
    }
    
    // Update previousChildren to track changes
    if (state.previousChildren !== props.children) {
      return {
        previousChildren: props.children,
      };
    }

    return null;
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection:", event.reason);
    
    // Convert promise rejection to error boundary state
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    this.setState({
      hasError: true,
      error,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    // Clear error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optional: Add a small delay to prevent immediate re-error in some cases
    this.retryTimeoutId = window.setTimeout(() => {
      this.forceUpdate();
    }, 100);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                An unexpected error occurred while rendering this page. This has been logged for debugging.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button 
                onClick={this.handleRetry} 
                className="w-full"
                variant="outline"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-mono text-xs break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    // No error occurred, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;