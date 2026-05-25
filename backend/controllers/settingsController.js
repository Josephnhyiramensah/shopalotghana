import Settings from "../models/Settings.js"

// @GET /api/settings — public
export const getSettings = async function(req, res) {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/settings — admin only
export const updateSettings = async function(req, res) {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create(req.body)
    } else {
      Object.assign(settings, req.body)
      await settings.save()
    }
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}