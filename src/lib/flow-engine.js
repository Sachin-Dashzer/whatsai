import Flow from '@/models/Flow';
import Conversation from '@/models/Conversation';
import { sendTextMessage, sendTemplateMessage } from '@/lib/whatsapp';

export async function executeFlows(tenant, contact, conversation, messageText, isNewContact) {
  const flows = await Flow.find({ tenantId: tenant._id, isEnabled: true }).lean();
  if (!flows.length) return { contact, conversation };

  for (const flow of flows) {
    if (!matchesTrigger(flow.trigger, messageText, isNewContact)) continue;
    if (!matchesConditions(flow.conditions, contact, messageText)) continue;

    const result = await executeActions(flow.actions, tenant, contact, conversation, messageText);
    contact = result.contact;
    conversation = result.conversation;

    await Flow.findByIdAndUpdate(flow._id, { $inc: { executionCount: 1 } });
  }

  return { contact, conversation };
}

function matchesTrigger(trigger, messageText, isNewContact) {
  switch (trigger.type) {
    case 'any_message':
      return true;
    case 'new_contact':
      return isNewContact;
    case 'keyword': {
      const lower = messageText.toLowerCase();
      return (trigger.keywords || []).some((kw) => kw && lower.includes(kw.toLowerCase()));
    }
    case 'opt_in':
      return false; // handled via opt-in flow separately
    default:
      return false;
  }
}

function matchesConditions(conditions, contact, messageText) {
  if (!conditions?.length) return true;
  return conditions.every((cond) => {
    const { field, operator, value } = cond;
    let fieldValue;
    if (field === 'message_text') fieldValue = messageText;
    else if (field === 'contact_stage') fieldValue = contact.stage;
    else if (field === 'phone') fieldValue = contact.phone;
    else if (field === 'contact_tag') {
      if (operator === 'has_tag') return (contact.tags || []).includes(value);
      if (operator === 'not_has_tag') return !(contact.tags || []).includes(value);
      return true;
    }

    if (!fieldValue) return false;
    switch (operator) {
      case 'equals': return fieldValue === value;
      case 'not_equals': return fieldValue !== value;
      case 'contains': return fieldValue.toLowerCase().includes(value.toLowerCase());
      case 'starts_with': return fieldValue.toLowerCase().startsWith(value.toLowerCase());
      case 'ends_with': return fieldValue.toLowerCase().endsWith(value.toLowerCase());
      case 'is_set': return !!fieldValue;
      case 'is_not_set': return !fieldValue;
      default: return true;
    }
  });
}

async function executeActions(actions, tenant, contact, conversation, messageText) {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'send_message':
          if (action.params?.text) {
            await sendTextMessage(tenant.phoneNumberId, contact.phone, action.params.text, tenant.accessToken);
          }
          break;
        case 'add_tag':
          if (action.params?.tag && !contact.tags.includes(action.params.tag)) {
            contact.tags = [...contact.tags, action.params.tag];
            await contact.save();
          }
          break;
        case 'remove_tag':
          if (action.params?.tag) {
            contact.tags = contact.tags.filter((t) => t !== action.params.tag);
            await contact.save();
          }
          break;
        case 'update_stage':
          if (action.params?.stage) {
            contact.stage = action.params.stage;
            await contact.save();
          }
          break;
        case 'handover':
          conversation = await Conversation.findByIdAndUpdate(
            conversation._id,
            { status: 'human_takeover' },
            { new: true }
          );
          break;
        case 'send_template':
          if (action.params?.templateName) {
            await sendTemplateMessage(
              tenant.phoneNumberId,
              contact.phone,
              action.params.templateName,
              'en',
              [],
              tenant.accessToken
            );
          }
          break;
      }
    } catch {
      // Continue executing remaining actions even if one fails
    }
  }

  return { contact, conversation };
}
