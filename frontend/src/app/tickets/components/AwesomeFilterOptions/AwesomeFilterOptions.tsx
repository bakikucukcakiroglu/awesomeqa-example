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
import { Autocomplete, ButtonGroup, Chip, CircularProgress, Dialog, FormControlLabel, Menu, Paper, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useChannels, useTicketAuthors } from '../../../../queries/ticket.queries';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CheckOutlined, Close, FiberManualRecordOutlined, FilterAlt } from '@mui/icons-material';
import AwesomeStatusChip from '../../[id]/components/AwesomeStatusChip';


type AwsomeFilterOptionsProps = {
  open: boolean;
  onClose: () => void;
  anchor: null | HTMLElement;
};

type Channel = {
  id: string;
  name: string;
};

type Option = {
  id: string;
  label: string;
};

export default function AwsomeFilterOptions({ open, onClose, anchor }: AwsomeFilterOptionsProps) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const flagged: boolean = searchParams?.get("flagged") == "true";
  const author: string = searchParams?.get("author") || "";
  const channel: string = searchParams?.get("channel") || "";
  const status: string = searchParams?.get("status") || "";

  const flaggedCheckboxRef = React.useRef<HTMLInputElement>(null);
  const authorInputRef = React.useRef<HTMLInputElement>(null);
  const channelInputRef = React.useRef<HTMLInputElement>(null);

  const channels = useChannels();
  const [channelComboboxOpen, setChannelComboboxOpen] = React.useState(false);
  const channelsLoading = channelComboboxOpen && !channels?.length;


  const authors = useTicketAuthors();
  const [usersComboboxOpen, setUsersComboboxOpen] = React.useState(false);
  const usersLoading = usersComboboxOpen && !authors?.length;

  const [statusState, setStatusState] = React.useState<string>(status ? status : "open");

  React.useEffect(() => {
    setStatusState(status);
  }, [status]);

  const handleStatusChange = (newStatus: string) => {

    if (statusState == newStatus) {
      setStatusState("");
    } else {
      setStatusState(newStatus);
    }
  };

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

    if (statusState) {
      params.set("status", statusState);
    } else {
      params.delete("status");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleClear = () => {
    onClose();
    const params = new URLSearchParams(searchParams);
    params.delete("flagged");
    params.delete("author");
    params.delete("channel");
    params.delete("status");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Menu
      open={open}
      anchorEl={anchor}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation16.MuiDrawer-paper.MuiDrawer-paperAnchorLeft": {
          padding: 2,
          background: "transparent",
        }
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}

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
          <FormControl>
            <FormLabel htmlFor='status' sx={{ fontWeight: 'bold' }}>
              Status
            </FormLabel>
            <Stack direction={"row"} gap={1}>
              <AwesomeStatusChip
                status={statusState}
                handleStatusChange={(newStatus) => handleStatusChange(newStatus)}
                returnGroup={true}
              />
            </Stack>
          </FormControl>
        </Stack>
      </DialogContent>
      <Divider sx={{ mt: 'auto' }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1}
        padding={1}
        paddingBottom={0}
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
    </ Menu>
  );
}