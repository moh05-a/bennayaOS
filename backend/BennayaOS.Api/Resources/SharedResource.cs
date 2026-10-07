namespace BennayaOS.Api.Resources;

/// <summary>
/// Marker type for IStringLocalizer&lt;SharedResource&gt;. Every user-facing
/// message in the API is looked up through it.
///
/// The English text itself is the lookup key, so English needs no resource
/// file at all: a missing key simply returns the key. Translations live in
/// SharedResource.{culture}.resx next to this file, e.g. SharedResource.ar.resx.
/// Adding a message = write it in English in code, then add one Arabic entry.
/// </summary>
public class SharedResource
{
}
