import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Autocomplete, ButtonGroup, CircularProgress, FormControlLabel, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useChannels, useTicketAuthors } from '../../../../queries/ticket.queries';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FilterAlt } from '@mui/icons-material';

type AwsomeFilterOptionsProps = {
  open: boolean;
  onClose: () => void;
};

type Channel = {
  id: string;
  name: string;
};

type Option = {
  id: string;
  label: string;
};

export default function AwsomeFilterOptions({ open, onClose }: AwsomeFilterOptionsProps) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const flagged: boolean = searchParams?.get("flagged") == "true";
  const author: string = searchParams?.get("author") || "";
  const channel: string = searchParams?.get("channel") || "";

  const flaggedCheckboxRef = React.useRef<HTMLInputElement>(null);
  const authorInputRef = React.useRef<HTMLInputElement>(null);
  const channelInputRef = React.useRef<HTMLInputElement>(null);

  const channels = useChannels();
  const [channelComboboxOpen, setChannelComboboxOpen] = React.useState(false);
  const channelsLoading = channelComboboxOpen && !channels?.length;


  const authors = useTicketAuthors();
  const [usersComboboxOpen, setUsersComboboxOpen] = React.useState(false);
  const usersLoading = usersComboboxOpen && !authors?.length;


  const authorOptions = React.useMemo(() => {

    if (authors && authors.length > 0) {
      return authors.map((author) => {
        return {
          id: author.id,
          label: author.name,
        };
      });
    }

    return [];
  }, [authors]);

  const onFilter = () => {
    onClose();
    const params = new URLSearchParams(searchParams);

    if (flaggedCheckboxRef?.current?.checked) {
      params.set("flagged", "true");
    } else {
      params.delete("flagged");
    }

    if (authorInputRef?.current?.value) {
      params.set("author", authorInputRef.current.value);
    } else {
      params.delete("author");
    }

    if (channelInputRef?.current?.value) {
      params.set("channel", channelInputRef.current.value);
    } else {
      params.delete("channel");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleClear = () => {
    onClose();
    const params = new URLSearchParams(searchParams);
    params.delete("flagged");
    params.delete("author");
    params.delete("channel");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation16.MuiDrawer-paper.MuiDrawer-paperAnchorLeft": {
          padding: 2,
          background: "transparent",
        }
      }}
    >
      <Paper
        sx={{
          borderRadius: 'md',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <DialogTitle>Filters</DialogTitle>
        <Divider />
        <DialogContent sx={{ gap: 2 }}>
          <Stack sx={{ gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="combo-box-channel" sx={{ fontWeight: 'bold' }}>
                Channel
              </FormLabel>
              <Autocomplete
                disablePortal
                id="combo-box-channel"
                defaultValue={channel}
                sx={{ width: 300 }}
                open={channelComboboxOpen}
                onOpen={() => {
                  setChannelComboboxOpen(true);
                }}
                onClose={() => {
                  setChannelComboboxOpen(false);
                }}
                loading={channelsLoading}
                options={channels || []}
                renderInput={(params) => (
                  <TextField
                    inputRef={channelInputRef}
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {channelsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="combo-box-user" sx={{ fontWeight: 'bold' }}>
                Author
              </FormLabel>
              <Autocomplete
                disablePortal
                id="combo-box-user"
                defaultValue={{ id: author, label: author }}
                sx={{ width: 300 }}
                open={usersComboboxOpen}
                onOpen={() => {
                  setUsersComboboxOpen(true);
                }}
                onClose={() => {
                  setUsersComboboxOpen(false);
                }}
                loading={usersLoading}
                options={authorOptions}
                renderOption={(props, option: Option) => (
                  <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                      loading="lazy"
                      width="20"
                      src={authors?.find((author) => author.id === option.id)?.avatar_url}
                      alt=""
                    />
                    {option.label}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    inputRef={authorInputRef}
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='date' sx={{ fontWeight: 'bold' }}>
                Date
              </FormLabel>
              <Stack direction="row" spacing={2} alignItems={"center"}>
                <DatePicker ></DatePicker>
                <Typography variant="h6">-</Typography>
                <DatePicker></DatePicker>
              </Stack>
            </FormControl>
            <FormControlLabel control={<Checkbox defaultChecked={flagged} inputRef={flaggedCheckboxRef} />} label="Show only flagged tickets." />
          </Stack>
        </DialogContent>
        <Divider sx={{ mt: 'auto' }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={1}
        >
          <Button
            variant="outlined"
            onClick={() => {
              handleClear();
            }}
          >
            Clear
          </Button>
          <Button onClick={onFilter} startIcon={<FilterAlt />}>
            Filter
          </Button>
        </Stack>
      </Paper>
    </Drawer>
  );
}