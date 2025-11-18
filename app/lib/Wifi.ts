import ipRangeCheck from "ip-range-check";

export function getClientIp(req:Request){
    const xff = req.headers.get("x-forwarded-for");
    if (xff){
        const ips = xff.split(",").map(s=> s.trim());
        return ips[0]
    }
    const cf = req.headers.get("cf-connecting-ip");
    if(cf) 
        return cf
    const via = req.headers.get("x-real-ip")
    if(via) return via
    return null
}
export function Ipallowed(ip: string | null){
    if(!ip) return false;
    const cidrEnv  = process.env.ALLOWED_WIFI_CIDRS || "";
    const cidrs = cidrEnv.split(",").map(s => s.trim()).filter(Boolean);
    if (cidrs.length === 0) return false;
    return ipRangeCheck(ip, cidrs);
  }