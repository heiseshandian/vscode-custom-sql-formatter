-- 查询支持slg的设备
SELECT
    *
FROM
    VDEVICETYPES
WHERE
    SLGHPPERSONAL_SUPPORTED = -1;

-- 查询支持购买的设备
SELECT
    DISTINCT d.devicetypename,
    d.COUNTRYID,
    d.BRANDID,
    c.NAME
FROM
    vdevicetype_nbs d
    LEFT JOIN vdeviceavailabilityrules r ON r.devicetype = d.devicetype
    AND r.brandid = d.brandid
    AND (
        r.countryid = 1
        OR r.countryid = 0
    )
    AND r.rulestate = 1
    AND r.startdate <= sysdate
    LEFT JOIN COUNTRYCODE c ON c.COUNTRYID = d.COUNTRYID
WHERE
    d.devicetypename IN ('ALEH3G');