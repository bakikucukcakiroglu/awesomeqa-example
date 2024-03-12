import { CheckOutlined, Close, FiberManualRecordOutlined } from "@mui/icons-material";
import { Chip } from "@mui/material";

type AwesomeStatusChipProps = {
  status: string,
  handleStatusChange?: (status: string) => void,
  returnGroup?: boolean
}

export default function AwesomeStatusChip({ status, handleStatusChange, returnGroup }: AwesomeStatusChipProps) {

  return (
    <>
      {(returnGroup || status == "open") &&
        <Chip
          label="open"
          variant={status == "open" ? "filled" : "outlined"}
          color="info"
          icon={<FiberManualRecordOutlined />}
          sx={{
            cursor: "pointer"
          }}
          onClick={() => { handleStatusChange && handleStatusChange("open") }}
        />
      }
      {(returnGroup || status == "resolved") &&
        <Chip
          label="resolved"
          variant={status == "resolved" ? "filled" : "outlined"}
          color="success"
          icon={<CheckOutlined />}
          sx={{
            cursor: "pointer"
          }}

          onClick={() => { handleStatusChange && handleStatusChange("resolved") }}
        />
      }
      {(returnGroup || status == "closed") &&
        <Chip
          label="closed"
          variant={status == "closed" ? "filled" : "outlined"}
          color="error"
          icon={<Close />}
          sx={{
            cursor: "pointer"
          }}
          onClick={() => { handleStatusChange && handleStatusChange("closed") }}
        />
      }
    </>
  );

}
