import { Box, ButtonBase, Dialog, DialogTitle, Divider, IconButton, Stack, Typography } from "@mui/material";
import AwesomeIcon from "../../../../components/AwesomeIcon";
import { useState } from "react";
import { Send } from "@mui/icons-material";

type AwesomeResolverProps = {
  open: boolean,
  onClose: () => void,
  handleResolve: (content: string) => void
}

export default function AwesomeResolver({ open, onClose, handleResolve }: AwesomeResolverProps) {

  const [page, setPage] = useState(0);
  const [content, setContent] = useState("");


  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPage(0);
    }, 300);
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <Stack direction={"row"} gap={1} padding={1}>
        <AwesomeIcon />
        Resolve
      </Stack>
      <Divider />
      {page == 0 &&
        <Stack direction={"row"}>
          <ButtonBase
            component={"div"}
            sx={{
              flex: 1,
              height: "200px",
              borderRight: "1px solid rgba(255, 255, 255, 0.12)",
              background: "linear-gradient(rgb(93, 80, 195) 0%, rgba(190, 90, 255, 0.7) 100%)",
              '&:hover': {
                background: "linear-gradient(rgb(93, 80, 195) 0%, rgba(190, 90, 255, 0.7) 0%)",
              }
            }}
            onClick={
              () => {
                setPage(1);
              }
            }
          >
            <Typography
              variant={"h6"}
              sx={{ fontWeight: "bold" }}
            >
              Answer with AI
            </Typography>
          </ButtonBase>
          <ButtonBase
            component={"div"}
            sx={{
              flex: 1,
              '&:hover': {
                background: "linear-gradient(rgb(93, 80, 195) 0%, rgba(190, 90, 255, 0.7) 0%)",
              }
            }}
            onClick={
              () => {
                setPage(2);
              }
            }
          >
            <Typography
              variant={"h6"}
              sx={{
                fontWeight: "bold",
              }}
            >
              Answer yourself
            </Typography>
          </ButtonBase>
        </Stack>
      }
      {page == 1 &&
        <Box>
          <DialogTitle>
            Answer with AI
          </DialogTitle>
        </Box>
      }
      {page == 2 &&
        <Stack alignItems={"center"} padding={2}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", height: "200px", padding: "8px", resize: "vertical", maxHeight: "500px" }} >

          </textarea>
          <IconButton
            sx={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              color: "rgb(93, 80, 195)",
              backgroundColor: "white",
              '&:hover': {
                backgroundColor: "rgba(255, 255, 255, 0.8)"
              }
            }}
            onClick={() => handleResolve(content)}
          >
            <Send />
          </IconButton>
        </Stack>
      }
    </Dialog>
  )
}