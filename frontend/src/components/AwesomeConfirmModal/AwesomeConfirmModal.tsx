import { WarningRounded } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, createTheme, ThemeProvider, Paper } from '@mui/material';
import ReactDOM from 'react-dom';

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});
function ConfirmationModal({ resolve, options }: { resolve: (result: boolean) => void, options: IConfirmOptions }) {

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={true}  >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <WarningRounded />
          &nbsp;
          {options.title || "Confirmation"}
        </DialogTitle>
        < Divider />
        <DialogContent>
          {options.message || "Are you sure you want to discard all of your notes ?"}
        </DialogContent>
        < DialogActions >
          <Button onClick={() => resolve(false)}>
            {options.cancelText || "Cancel"}
          </Button>
          <Button color="error" onClick={() => resolve(true)}>
            {options.confirmText || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

interface IConfirmOptions {
  title?: string;
  message?: string | JSX.Element;
  confirmText?: string;
  cancelText?: string;
}

export default function useConfirm() {

  const confirm = (options: IConfirmOptions) => {
    return new Promise((resolve) => {
      const modalRoot = document.createElement('div');
      document.body.appendChild(modalRoot);

      const handleResolve = (result) => {
        ReactDOM.unmountComponentAtNode(modalRoot);
        document.body.removeChild(modalRoot);
        resolve(result);
      };

      ReactDOM.render(<ConfirmationModal options={options} resolve={handleResolve} />, modalRoot);
    });
  };

  return {
    confirm
  }
}