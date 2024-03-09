import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useRouter, } from "next/router";
import { formatRelative, set } from "date-fns";
import {
  Badge, Box, Checkbox, Divider, IconButton, LinearProgress, List, ListItemAvatar, ListItemButton,
  ListItemIcon, ListItemText, Skeleton, Stack, Tooltip, Typography
} from "@mui/material";
import { CheckCircleOutline, DateRange, Delete, DeleteOutline, Flag, FlagOutlined, NavigateBefore, NavigateNext, Refresh, Tag } from "@mui/icons-material";
import AwesomeAvatar from "./components/AwesomeAvatar";
import AwsomeFilterOptions from "./components/AwesomeFilterOptions/AwesomeFilterOptions";
import AwesomeInputBase from "./components/AwesomeInputBase";
import HeadComponent from "../../components/Head";
import { useDeleteTickets, useFlagTickets, useTickets } from "../../queries/ticket.queries";
import DiscordIcon from "../../assets/DiscordIcon";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function Tickets() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const page: number = searchParams?.get("page") ? parseInt(searchParams?.get("page")) : 1;
  const query = searchParams?.get("query") || "";
  const flagged: Boolean = searchParams?.get("flagged") == "true";
  const author: string = searchParams?.get("author") || "";
  const channel: string = searchParams?.get("channel") || "";

  const { tickets, refetch, loading, enabled, setEnabled, size } = useTickets(page, flagged, author, channel);
  const flagTickets = useFlagTickets();
  const deleteTickets = useDeleteTickets(refetch);

  const [filterOptionsOpen, setFilterOptionsOpen] = useState(false);
  const [ticketsToDisplay, setTicketsToDisplay] = useState(tickets?.data);

  const [rowSelection, setRowSelection] = useState([]);

  const flag = !rowSelection?.every((ticket) => ticketsToDisplay.find((t) => t._id === ticket).flagged);

  useEffect(() => {
    // Check if the page query parameter is missing or empty
    if (!router.query.page) {
      router.replace('/tickets?page=1');
    }
  }, [router]);

  useEffect(() => {
    if (searchParams?.size > 0) {
      if (!enabled) {
        setEnabled(true);
      }
    }
  }, [searchParams?.size]);

  useEffect(() => {
    setTicketsToDisplay(tickets?.data);
  }, [tickets?.data]);

  useEffect(() => {

    if (page && tickets?.total_count && (page > Math.ceil(tickets?.total_count / size))) {
      onPageChange(Math.ceil(tickets?.total_count / size));
    }
  }, [tickets?.total_count, page]);

  const handleClickFlag = (_id) => {
    flagTickets([_id], !ticketsToDisplay.find((ticket) => ticket._id === _id).flagged);
    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (ticket._id == _id) {
        ticket.flagged = !ticket.flagged;
      }
      return ticket;
    }
    ));
  }

  const handleFlagAll = () => {

    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (rowSelection.indexOf(ticket._id) !== -1) return { ...ticket, flagged: flag };
      return ticket;
    }))

    flagTickets(rowSelection, flag);
  }


  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace({
      search: params.toString()
    });
  }

  const onQueryChange = (newQuery) => {
    const params = new URLSearchParams(searchParams);

    if (query == newQuery) return;
    params.set("query", newQuery);

    router.replace({
      search: params.toString()
    });
  }

  return (
    <Box sx={{ overflow: "auto", height: "-webkit-fill-available", position: "relative" }}>
      <AwsomeFilterOptions
        open={filterOptionsOpen}
        onClose={() => setFilterOptionsOpen(!filterOptionsOpen)}
      />
      <HeadComponent title={"Tickets"} metaData={"Tickets"} />
      <Box sx={{
        position: "sticky", top: "0px", zIndex: 1000, backdropFilter: "blur(10px)"
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 1, }}>
          <Stack direction={"row"} alignItems={"center"}>
            <Checkbox
              edge="start"
              tabIndex={-1}
              disableRipple
              indeterminate={rowSelection.length > 0 && rowSelection.length < ticketsToDisplay.length}
              sx={{ ml: "4px" }}
              onChange={(event) => {
                setRowSelection(event.target.checked ? ticketsToDisplay.map((ticket) => ticket._id) : []);
              }}
            />

            <Divider orientation="vertical" flexItem sx={{ margin: 1 }} />
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => refetch()}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            {rowSelection?.length ?
              <>
                <Tooltip title="Resolve All">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTickets(rowSelection);
                      setRowSelection([]);
                    }}
                  >
                    <CheckCircleOutline />
                  </IconButton>
                </Tooltip>
                <Tooltip title={flag ? "Flag All" : "Remove Flag All"}>
                  <IconButton
                    onClick={() => {
                      handleFlagAll();
                      setRowSelection([]);
                    }}
                  >
                    {flag ? <FlagOutlined /> : <Flag color="error" />}
                  </IconButton>
                </Tooltip>
              </> : null
            }
          </Stack>
          <Stack direction={"row"} alignItems={"center"}>
            <AwesomeInputBase
              onClickFilterOptions={() => setFilterOptionsOpen(true)}
              onQueryChange={(query) => onQueryChange(query)}
              queryDefault={query}
              activeFilterCount={searchParams?.size - 1 + (flagged ? 1 : 0)}
            />
            <Typography
              fontSize={"0.75em"}
              sx={{ fontVariantNumeric: "tabular-nums" }}
            >
              {(tickets?.total_count == null || tickets?.total_count == undefined) ? <Skeleton width={90} /> : `${(page - 1) * size}-${Math.min(page * size, tickets?.total_count)} of ${tickets?.total_count}`}
            </Typography>
            <IconButton
              size="small"
              disabled={page == 1}
              onClick={() => {
                if (page == 1) return;
                onPageChange(page - 1)
              }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              size="small"
              disabled={page * size >= tickets?.total_count}
              onClick={() => {
                if (page * size >= tickets?.total_count) return;
                onPageChange(page + 1)
              }}>
              <NavigateNext />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
      </Box>
      <Box sx={{ position: "relative" }}>
        <List>
          {
            ticketsToDisplay ?
              ticketsToDisplay.map((ticket) => (
                <ListItemButton
                  key={ticket._id}
                  onClick={() => {
                    router.push(`/tickets/${ticket._id}`);
                  }}
                  sx={{
                    '&:hover': {
                      '& .button-box': {
                        display: 'block',
                      },
                      '& .date': {
                        display: 'none',
                      }
                    },
                  }}
                >
                  <ListItemIcon onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                    <Checkbox
                      edge="start"
                      checked={rowSelection.indexOf(ticket._id) !== -1}
                      tabIndex={-1}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setRowSelection(rowSelection.indexOf(ticket._id) !== -1 ? rowSelection.filter((id) => id !== ticket._id) : [...rowSelection, ticket._id]);
                      }}
                    />
                  </ListItemIcon>
                  <ListItemAvatar>
                    <AwesomeAvatar
                      src={ticket?.message?.author?.avatar_url}
                      fallbackColor={ticket?.message?.author?.color || stringToColor(ticket.message.author.name)}
                      fallbackLetter={ticket?.message?.author?.name[0]}
                    />
                  </ListItemAvatar>
                  <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} flex={1}>
                    <ListItemText
                      primary={
                        <Stack direction={"row"} gap={1}>
                          {ticket?.message?.author?.name}
                          <Typography
                            // className="date"
                            variant="caption"
                            sx={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "text.secondary" }}
                          >
                            <Tag fontSize="inherit" /> {ticket?.message?.channel_id}
                          </Typography>
                        </Stack >
                      }
                      secondary={
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <Badge color="error" variant="dot"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                              sx={{
                                '& .MuiBadge-badge': {
                                  top: "4px",
                                  left: "-1px",
                                  padding: '0 4px',
                                  display: ticket.flagged ? "block" : "none"
                                },
                              }}
                            >
                              <Box component="span" >
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >

                                  {ticket?.message?.content}
                                </Typography>
                              </Box>
                            </Badge>
                          </span>
                          <Typography className="date" variant="caption" sx={{ display: "flex", alignItems: "center", marginLeft: 1 }} >
                            <DateRange sx={{ fontSize: "inherit" }} />
                            &nbsp;
                            {formatRelative(new Date(ticket.timestamp), new Date())}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box className="button-box" sx={{ display: "none", minWidth: "max-content" }}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClickFlag(ticket._id)
                        }}
                      >
                        {ticket.flagged ? <Flag color="error" /> : <FlagOutlined />}
                      </IconButton>
                      <Link
                        target="_blank"
                        href={ticket?.message?.msg_url}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <IconButton
                          size="small"
                        >
                          <DiscordIcon />
                        </IconButton>
                      </Link>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRowSelection(rowSelection.filter((id) => id !== ticket._id));
                          deleteTickets([ticket._id]);
                        }}
                      >
                        <CheckCircleOutline />
                      </IconButton>
                    </Box>
                  </Stack>
                </ListItemButton>
              )) :
              Array.from(Array(50).keys()).map((ticket) => {
                return <Skeleton key={`skeleton-${ticket}`} variant="rectangular" height={72} sx={{ margin: 1 }} />
              })
          }
        </List>
      </Box>
      {
        loading && <Box sx={{ width: '100%', position: "absolute", bottom: 0 }}>
          <LinearProgress />
        </Box>
      }
    </Box >
  );
}