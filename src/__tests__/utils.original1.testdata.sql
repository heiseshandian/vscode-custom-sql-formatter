-- ckl related tables:
SELECT
    *
FROM
    CKL_DEFAULTLAYOUTS cd;

SELECT
    *
FROM
    CKL_LAYOUTGROUPS cl;

SELECT
    *
FROM
    CKL_LAYOUTS cl;

SELECT
    *
FROM
    CKL_LAYOUTTYPES cl;

SELECT
    *
FROM
    CKL_MAILBOXLAYOUTS cm;

SELECT
    *
FROM
    CKL_USERLAYOUTS cu;

SELECT
    *
FROM
    DEVICETYPES d;

-- digitalLine/listCKLLayoutGroups
SELECT
    DISTINCT Apd.LayoutGroupID,
    Lgp.Description,
    Lgp.DeviceManufacturerID,
    Lgp.DeviceManufacturerName,
    DECODE(Ads.sidecarNumber, NULL, 0, 1) as withExpansionModules
from
    VAllPhoneDevices Apd
    JOIN VCKL_LayoutGroups Lgp ON Lgp.LayoutGroupID = Apd.LayoutGroupID
    LEFT JOIN VAIDeviceSidecars ads ON Ads.instanceId = Apd.instanceId
where
    Apd.MailboxID = 400129684115
    AND Apd.UserId = 400129684115
    AND Apd.LayoutGroupID IS NOT NULL
order by
    Lgp.Description desc,
    withExpansionModules DESC;

-- digitalLine/listPermittedMailboxes
-- 1.get mailboxes through bellow sql
-- 2. if (isOrbitParkLocationEnabled(sp661) && extType == OrbitParkLocation)
---3. else if(!mailboxId.equals(request.getMailboxId() && !blfSeeDisabled && !isUnassignExt) //blfSeeDisabled = mailbox.getVarAsBoolean(BLF_See)
select
    m.mailboxid as mailboxid2,
    m.firstname,
    m.lastname,
    m.pin,
    m.department,
    m.mailboxstate,
    m.extensiontype,
    m.ispasswordempty,
    m.Permissions.BLF_See,
    m.bizLocationId,
    bizLocationName,
    m.cd_hidden
from
    vmailboxes m
    left join vBizLocations loc ON loc.bizLocationID = m.bizLocationID
    left join BLF_Permissions p on p.MonitoredMailboxID = m.mailboxid
where
    m.userid = 400129684115
    and m.extensiontype in (1, 5, 6, 7, 12, 13) -- USER,DigitalUser,VirtualUser,FaxUser,OrbitParkLocation,VoiceOnly
    and (
        m.extensiontype <> 12
        or p.MONITORINGMAILBOXID = 400129684115
    );

-- monitoredMailboxInfos(blf)
select
    linenumber,
    ringoncall,
    monitoredmailboxid as mailboxid2,
    firstname,
    lastname,
    pin,
    department,
    bizLocationId,
    bizLocationName,
    isQueue
from
    VPRESENCECONFIG
where
    monitoringmailboxid = 400129684115
order by
    linenumber;

-- getSharedLinesPresence(bla)
select
    vp.linenum,
    vp.slg_mailboxid as mailboxid2,
    vp.firstname,
    vp.lastname,
    vp.pin,
    vp.department,
    vp.slg_bizLocationId as bizlocationId,
    bizLocationName,
    phonelinetype,
    lineName,
    vp.bca_appearances
from
    vslgpersonalhp_presence vp
    left join vBizLocations loc ON loc.bizLocationId = vp.slg_bizlocationId
where
    vp.userId = 400129684115
    and vp.mailboxid = 400129684115
    and slg_mailboxState != 1 -- disabled
order by
    linenum;

-- users
select
    *
from
    Vusers