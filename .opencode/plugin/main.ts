import compose from "opencode-plugin-compose"
import { forceAgent } from "opencode-plugin-copilot"
import notification from "opencode-plugin-notification"

export default compose([forceAgent(), notification()])
