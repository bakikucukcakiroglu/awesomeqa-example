"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Badge, Box, Checkbox, Chip, Divider, IconButton, LinearProgress, List, ListItemAvatar, ListItemButton,
  ListItemIcon, ListItemText, Skeleton, Stack, Tooltip, Typography
} from "@mui/material";
import { CheckCircleOutline, CheckOutlined, Close, CloseOutlined, DateRange, FiberManualRecord, FiberManualRecordOutlined, Flag, FlagOutlined, Forum, Loop, NavigateBefore, NavigateNext, Refresh, Tag } from "@mui/icons-material";
import AwesomeAvatar from "./components/AwesomeAvatar";
import AwsomeFilterOptions from "./components/AwesomeFilterOptions/AwesomeFilterOptions";
import AwesomeInputBase from "./components/AwesomeInputBase";
import { useFlagTickets, useTickets, useCloseTickets, useOpenTickets } from "../../queries/ticket.queries";
import DiscordIcon from "../../components/DiscordIcon";

import { Ticket } from "../../types";
import AwesomeStatusChip from "./[id]/components/AwesomeStatusChip";

export default function Tickets() {

  const params = useParams<{ id: string }>()
  const id = params?.id;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page: number = id ? Number(localStorage.getItem("page")) : (searchParams?.get("page") ? parseInt(searchParams?.get("page") || "0") : 1);
  const query: string = id ? (localStorage.getItem("query") || "") : (searchParams?.get("query") || "");
  const flagged: boolean = id ? (localStorage.getItem("flagged") == "true") : (searchParams?.get("flagged") == "true");
  const author: string = id ? (localStorage.getItem("author") || "") : (searchParams?.get("author") || "");
  const channel: string = searchParams?.get("channel") || "";
  const status: string = id ? (localStorage.getItem("status") || "") : (searchParams?.get("status") || "");

  const { tickets, refetch, loading, enabled, setEnabled, size } = useTickets({ page, flagged, author, channel, status, query });
  const flagTickets = useFlagTickets();
  const closeTickets = useCloseTickets(refetch);
  const openTickets = useOpenTickets(refetch);

  const [rowSelection, setRowSelection] = useState<string[]>([]);
  const [ticketsToDisplay, setTicketsToDisplay] = useState<Ticket[]>([]);
  const [filterOptionsOpen, setFilterOptionsOpen] = useState(false);

  const flag = !rowSelection?.every((ticket) => ticketsToDisplay?.find((t) => t._id === ticket)?.flagged);

  useEffect(() => {

    console.log("searchParams?.size", searchParams?.size);
    if (!params.id) {
      if (!enabled) {
        setEnabled(true);
      }
    } else {
      if (enabled) {
        setEnabled(false);
      }
    }
  }, [searchParams?.size]);

  useEffect(() => {
    setTicketsToDisplay(tickets?.data || []);
  }, [tickets?.data]);

  useEffect(() => {

    if (page && tickets?.total_count && (page > Math.ceil(tickets?.total_count / size))) {
      onPageChange(Math.ceil(tickets?.total_count / size));
    }
  }, [tickets?.total_count, page]);

  const handleClickFlag = (_id) => {
    flagTickets([_id], !ticketsToDisplay.find((ticket) => ticket._id === _id)?.flagged);
    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (ticket._id == _id) {
        ticket.flagged = !ticket.flagged;
      }
      return ticket;
    }
    ));
  }

  const handleFlagMultiple = () => {

    setTicketsToDisplay(ticketsToDisplay.map((ticket) => {
      if (rowSelection.indexOf(ticket._id) !== -1) return { ...ticket, flagged: flag };
      return ticket;
    }))

    flagTickets(rowSelection, flag);
  }


  const handleResolve = (id) => {

    router.push(`${pathname}/${id}`);
  }

  const handleCloseMultiple = () => {
    setRowSelection([]);
    closeTickets(rowSelection);
  }

  const handleClose = (id) => {
    setRowSelection(rowSelection.filter((id) => id !== id));
    closeTickets([id]);
  }

  const handleOpenMultiple = () => {
    setRowSelection([]);
    openTickets(rowSelection);
  }

  const handleOpen = (id) => {
    setRowSelection(rowSelection.filter((id) => id !== id));
    openTickets([id]);
  }

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(
      `${pathname}?${params.toString()}`,
    );
  }

  const onQueryChange = (newQuery) => {
    const params = new URLSearchParams(searchParams);

    if (query == newQuery) return;

    if (newQuery == "") params.delete("query")
    else params.set("query", newQuery);

    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleStatusChange = (newStatus) => {
    const params = new URLSearchParams(searchParams);
    if (status == newStatus) {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  console.log("rowSelection", rowSelection);

  return (
    <>
      <Box sx={{ overflow: "auto", height: "-webkit-fill-available", position: "relative" }}>
        <AwsomeFilterOptions
          open={filterOptionsOpen}
          onClose={() => setFilterOptionsOpen(!filterOptionsOpen)}
          anchor={document.getElementById("filter-options-anchor")}
        />
        <Box sx={{
          position: "sticky", top: "0px", zIndex: 1000, backdropFilter: "blur(10px)"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction={"row"} alignItems={"center"}>
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                checked={rowSelection.length > 0 && rowSelection.length === ticketsToDisplay.length}
                indeterminate={rowSelection.length > 0 && rowSelection.length < ticketsToDisplay.length}
                sx={{ ml: "4px" }}
                onChange={(event) => {
                  setRowSelection(event.target.checked ? ticketsToDisplay.map((ticket) => ticket._id) : []);
                }}
              />

              <Divider orientation="vertical" flexItem sx={{ margin: 1 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginRight: 1 }}
              >
                Tickets
              </Typography>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => refetch()}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              {rowSelection?.length ?
                <>
                  <Tooltip title={flag ? "Flag Selected Tickets" : "Remove Flags From Selected Tickets"}>
                    <IconButton
                      onClick={() => {
                        handleFlagMultiple();
                        setRowSelection([]);
                      }}
                      sx={{
                        transition: "all 0.3s",
                        '&:hover': {
                          color: "error.main"
                        }
                      }}
                    >
                      {flag ? <FlagOutlined /> : <Flag color="error" />}
                    </IconButton>
                  </Tooltip>
                  {
                    (status == "open" || status == "") ?
                      <Tooltip title="Close Selected Tickets">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseMultiple();
                          }}
                          sx={{
                            transition: "all 0.3s",
                            '&:hover': {
                              color: "error.main"
                            }
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Tooltip> : null
                  }
                  {(status == "closed" || status == "resolved" || status == "") &&
                    <Tooltip title="Re-open Selected Tickets">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMultiple();
                        }}
                        sx={{
                          transition: "all 0.3s",
                          '&:hover': {
                            color: "info.main"
                          }
                        }}
                      >
                        <Loop />
                      </IconButton>
                    </Tooltip>
                  }

                </> : null
              }
            </Stack>
            <Stack direction={"row"} alignItems={"center"} gap={1}>
              <AwesomeStatusChip status={status} handleStatusChange={handleStatusChange} returnGroup={true} />
              <AwesomeInputBase
                onClickFilterOptions={() => setFilterOptionsOpen(true)}
                onQueryChange={(query) => onQueryChange(query)}
                queryDefault={query}
                activeFilterCount={
                  (flagged ? 1 : 0) +
                  (author.length ? 1 : 0) +
                  (channel.length ? 1 : 0) +
                  (status.length ? 1 : 0)
                }
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
                disabled={page * size >= (tickets?.total_count || 0)}
                onClick={() => {
                  if (page * size >= (tickets?.total_count || 0)) return;
                  onPageChange(page + 1)
                }}>
                <NavigateNext />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          {
            loading && <Box sx={{ width: '100%', position: "absolute", bottom: 0 }}>
              <LinearProgress />
            </Box>
          }
        </Box>
        <Box >
          <List>
            {
              tickets?.data ?
                (tickets?.data || ticketsToDisplay).map((ticket) => (
                  <ListItemButton
                    key={ticket._id}
                    onClick={() => {
                      setEnabled(false);
                      router.push(`/tickets/${ticket._id}`);
                      localStorage.setItem("page", page.toString());
                      localStorage.setItem("size", size.toString());
                      localStorage.setItem("flagged", flagged.toString());
                      localStorage.setItem("author", author);
                      localStorage.setItem("channel", channel);
                      localStorage.setItem("status", status);
                      localStorage.setItem("query", query);

                      // localStorage.setItem("page", page.toString());
                    }}
                    sx={{
                      '&:hover': {
                        '& .button-box': {
                          display: 'block',
                        },
                        '& .MuiTooltip-popper': {
                          display: "flex",
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
                        fallbackColor={ticket?.message?.author?.color}
                        fallbackLetter={ticket?.message?.author?.name[0]}
                        uniqueKey={ticket?.message?.author?.id}
                      />
                    </ListItemAvatar>
                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} flex={1}>
                      <ListItemText
                        primary={
                          <Stack direction={"row"} gap={1}>
                            <>
                              {ticket?.message?.author?.name}
                              <Tooltip
                                title={"Channel"}
                                enterDelay={300}
                                slotProps={{
                                  popper: {
                                    modifiers: [
                                      {
                                        name: 'offset',
                                        options: {
                                          offset: [0, -14],
                                        },
                                      },
                                    ],
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "text.secondary" }}
                                >
                                  <Tag fontSize="inherit" />
                                  {ticket?.message?.channel_id}
                                </Typography>
                              </Tooltip>
                            </>
                            <Tooltip
                              title={"Context messages"}
                              enterDelay={300}
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: 'offset',
                                      options: {
                                        offset: [0, -14],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "text.secondary" }}
                              >
                                <Forum fontSize="inherit" /> {ticket?.context_messages?.length}
                              </Typography>
                            </Tooltip>
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
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >

                                  {ticket?.message?.content}
                                </Typography>
                              </Badge>
                            </span>
                          </Box>
                        }
                      />
                      <Stack >
                        <Chip
                          label={ticket.status}
                          color={ticket.status === "open" ? "info" : (ticket.status == "resolved" ? "success" : "error")}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: "capitalize" }}
                        />
                        {
                          ticket?.resolved_by && ticket?.status == "resolved" &&
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", position: "absolute", bottom: "5px", maxWidth: "67px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                          >
                            by {ticket?.resolved_by}
                          </Typography>
                        }
                      </Stack>
                      <Box sx={{ minWidth: "150px", display: "flex", justifyContent: "center" }}>
                        <Typography
                          className="date"
                          variant="caption"

                          sx={{ display: "flex", alignItems: "center", marginLeft: 1, textWrap: "nowrap", color: "text.secondary", alignSelf: "flex-end" }}
                        >
                          <DateRange sx={{ fontSize: "inherit" }} />
                          &nbsp;
                          {format(new Date(ticket.timestamp), "MMMM d, yyyy")}
                        </Typography>
                        <Box className="button-box" sx={{ display: "none" }}>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleClickFlag(ticket._id)
                            }}
                            sx={{
                              transition: "all 0.3s",
                              '&:hover': {
                                color: "error.main"
                              }
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
                              sx={{
                                transition: "all 0.3s",
                                '&:hover': {
                                  color: "#5865F2"
                                }
                              }}
                            >
                              <DiscordIcon />
                            </IconButton>
                          </Link>
                          {ticket.status == "open" &&
                            <IconButton
                              size="small"
                              sx={{
                                transition: "all 0.3s",
                                '&:hover': {
                                  color: "success.main"
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolve(ticket._id);
                              }}
                            >
                              <CheckCircleOutline />
                            </IconButton>}
                          {ticket.status == "open" ?
                            <IconButton
                              size="small"
                              sx={{
                                transition: "all 0.3s",
                                '&:hover': {
                                  color: "error.main"
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose(ticket._id);
                              }}
                            >
                              <Close />
                            </IconButton> :
                            <IconButton
                              size="small"
                              sx={{
                                transition: "all 0.3s",
                                '&:hover': {
                                  color: "info.main"
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpen(ticket._id);
                              }}
                            >
                              <Loop />
                            </IconButton>
                          }
                        </Box>
                      </Box>
                    </Stack>
                  </ListItemButton>
                )) :
                Array.from(Array(20).keys()).map((ticket) => {
                  return <Skeleton key={`skeleton-${ticket}`} variant="rectangular" height={72} sx={{ margin: 1 }} />
                })
            }
          </List>
        </Box>

      </Box >
    </>
  );
}