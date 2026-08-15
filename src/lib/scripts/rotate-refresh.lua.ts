// auth/scripts/rotate-refresh.lua.ts
export const ROTATE_REFRESH_SCRIPT = `
local record = redis.call('GET', KEYS[1])
if not record then
  return nil
end

local parsed = cjson.decode(record)

if parsed.used then
  return 'REUSED'
end

parsed.used = true
redis.call('SET', KEYS[1], cjson.encode(parsed), 'KEEPTTL')
return cjson.encode(parsed)
`;
